/*
 * jQuery LifeForm v1.0
 *
 * 2015 Fattan Labs
 * http://www.fattan.ru/
 *
 * Author: marchenko_am
 * Free to use
 *
 */

/*      Примеры использования (how to use):

$(document).ready(function () {

    var lifeFormCfg = {
        "hide": [ // скрыть #box_1 если нажат #radio_1
            {
                "if":   "#radio_1",
                "than": "#box_1"
            }
        ],
        "show": [   // показывает #box_1 если нажат #checkbox_1, иначе #box_2
            {
                "if":   "#checkbox_1",
                "than": "#box_1",
                "else": "#box_2"
            },
        ],
        "focus": [  // если нажат #radio_1 курсор фокусируется в #textarea_1
            { "if":   "#radio_1",           "than": "#textarea_1" }
        ]
    };

    $('#form_1').lifeForm(lifeFormCfg);


});

*/

(function( $ ) {

	$.fn.lifeForm = function(cfg) {

        if (typeof cfg !== 'object') {
            console.error('Ошибка LifeForm - Конфиг не определён!');
            return this;
        }

        return this.each(function() {

            // объект формы
            var $form = $(this);

            // класс для скрытия элементов
            var hideClass = 'lifeFormHide';

            // фильтруем элементы по их типу
            // удаляем непотребные элементы
            var filterTermsType = function ($if, type){

                return $if.filter(function(){

                    var $this = $(this);
                    return     $this.is('[type=' + type + ']')
                            && $this.attr('name') !== undefined
                            && !$this.is(':disabled');
                });
            };

            // возвращает массив с уникальными значениями
            var arrayUnique = function (value, index, arr) {
                return arr.indexOf(value) === index;
            };

            // возвращает имя элемента
            var nameByElement = function (index, element) {
                return $(element).attr("name");
            };

            // из массива имён делает строку
            // [name = "name1"], [name = "name2"], [name = "name3"]
            var namesListByArray = function (arr){

                var str_ids = '';

                // в массиве больше одного элемента?
                if (arr.length > 1) {

                    // делает из массива строку
                    // [name = "name1"], [name = "name2"], [name = "name3"]
                    str_ids = arr.map(function(item){
                        return '[name = "' + item + '"]';
                    }).join(', ');

                } else {
                    str_ids = '[name = "' + arr[0] + '"]';
                }

                return str_ids;
            };

            // разбираем условие на отдельные составляющие
            // определяем объекты на которые нужно навесить события
            var initTerm = function ($if) {

                var resultArr = [];

                // фильтруем элементы (радио отдельно, чекбоксы отдельно)
                var $radioItems     = filterTermsType($if, 'radio');
                var $checkboxItems  = filterTermsType($if, 'checkbox');

                // уникальный массив имён для радио-кнопок
                // (без повторений)
                var radioNames = $radioItems.map(nameByElement)
                                            .get()
                                            .filter(arrayUnique);

                // строка [name = "name1"], [name = "name2"]
                var radioNamesList = namesListByArray(radioNames);
                var $radioNames    = $(radioNamesList);

                // только если есть селекторы, кладём их
                // jQuery объекты в массив
                ($radioNames.length    > 0) && resultArr.push($radioNames);
                ($checkboxItems.length > 0) && resultArr.push($checkboxItems);

                // возвращаем массив с jQuery объктами
                // на которые надо навесить события
                return resultArr;
            };

            // навесить обработчики на элементы
            var setEventHandlersHide = function (terms, $if, $than, $else){

                terms.forEach(function (term) {

                    term.on('change.lifeFormHideEvents', function () {

                        // если хоть один из инпутов чекнут
                        if ($if.is(':checked')) {

                            // добавляем класс только тем элементам
                            // у которых его нет
                            $than.filter(':not(.' + hideClass + ')').addClass(hideClass);
                            $else.filter('.' + hideClass).removeClass(hideClass);

                        } else {

                            $than.filter('.' + hideClass).removeClass(hideClass);
                            $else.filter(':not(.' + hideClass + ')').addClass(hideClass);
                        }

                    });

                    // инициируем первоначальное состояние
                    // чтобы при загрузке страницы состояния
                    // инпутов были уже проверены
                    term.trigger('change.lifeFormHideEvents');

                });

            };

            // навесить обработчики на элементы
            var setEventHandlersShow = function (terms, $if, $than, $else){

                terms.forEach(function (term) {

                    term.on('change.lifeFormShowEvents', function () {

                        // если хоть один из инпутов чекнут
                        if ($if.is(':checked')) {

                            // добавляем класс только тем элементам
                            // у которых его нет
                            $than.filter('.' + hideClass).removeClass(hideClass);
                            $else.filter(':not(.' + hideClass + ')').addClass(hideClass);

                        } else {

                            $than.filter(':not(.' + hideClass + ')').addClass(hideClass);
                            $else.filter('.' + hideClass).removeClass(hideClass);
                        }

                    });

                    // инициируем первоначальное состояние
                    // чтобы при загрузке страницы состояния
                    // инпутов были уже проверены
                    term.trigger('change.lifeFormShowEvents');

                });

            };

            // навесить обработчики на элементы
            var setEventHandlersFocus = function (terms, $if, $than){

                terms.forEach(function (term) {

                    term.on('change.lifeFormFocusEvents', function () {

                        // если хоть один из инпутов чекнут
                        if ($if.is(':checked')) {

                            $than.focus();

                        } else {

                            $than.blur();
                        }

                    });

                });

                // если сфокусирован инпут/текстареа
                // то радиобатон(чакбокс),
                // с которым он связан чекается
                $than.on('click.lifeFormFocusEvents', function() {
                    if (!$if.is(':disabled') && !$if.is(':checked')) {
                        $if.prop('checked', true);
                    }
                });

            };

            // скрываем / показываем блоки
            cfg.hide && cfg.hide.forEach(function(act){

                act.if      = act.if    || '';
                act.than    = act.than  || '';
                act.else    = act.else  || '';

                var $if     = $(act.if,     $form);
                var $than   = $(act.than,   $form);
                var $else   = $(act.else,   $form);

                var terms = initTerm($if);

                // устанавливает обработчики
                // на элементы
                setEventHandlersHide(terms, $if, $than, $else);

            });

            // скрываем / показываем блоки
            cfg.show && cfg.show.forEach(function(act){

                act.if      = act.if    || '';
                act.than    = act.than  || '';
                act.else    = act.else  || '';

                var $if     = $(act.if,     $form);
                var $than   = $(act.than,   $form);
                var $else   = $(act.else,   $form);

                var terms = initTerm($if);

                // устанавливает обработчики
                // на элементы
                setEventHandlersShow(terms, $if, $than, $else);

            });

            // фокусируем в инпут при клике,
            // проставляем флажок радио/чекбокса,
            // если сами сфокусировали в инпут
            cfg.focus && cfg.focus.forEach(function(act){

                act.if      = act.if    || '';
                act.than    = act.than  || '';

                // для фокусировки должно быть по
                // одному селектору в
                // каждой выборке -> .eq(0)
                // остальные игнорим
                var $if     = $(act.if,     $form);
                var $than   = $(act.than,   $form);

                if ($if.length > 1 || $than.length > 1) {
                    console.error('Ошибка LifeForm - В полях if (' + act.if + ') и than (' + act.than + ') метода focus можно указать не более одного селектора!');
                    return false;
                }

                var terms = initTerm($if);

                // устанавливает обработчики
                // на элементы
                setEventHandlersFocus(terms, $if, $than);

            });

        });
    };

})(jQuery);