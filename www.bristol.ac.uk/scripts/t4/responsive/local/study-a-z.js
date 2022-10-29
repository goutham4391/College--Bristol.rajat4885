// Used on: http://www.bristol.ac.uk/study/undergraduate/search/


$(document).ready(function() {
        // inject the search field with a script
        var filterField = $('<input placeholder="Start typing course name, keyword or UCAS code" id="filter_input" type="text">').appendTo('.course-az:first > div:first');
        filterField.before('<h2 class="module-heading large">Filter A-Z of courses</h2>');
        var noResultsMsg = $('<p class="jsHide">There are no courses matching the chosen filter.</p>');
        var listing = $('.course-az-listings');
        var allLists = $('.course-results-list', listing);
        var allHeadings = $('h2', listing);
        listing.append(noResultsMsg);

        filterField.fastLiveFilter(allLists, {
            timeout: 200,
            callback : function(total){
                // If all elements in a list are hidden hide the list title
                allLists.each(function(index) {

                    var self = $(this);
                    var listElements = $('li', self);

                    var hiddenListElements = listElements.filter(function() {return $(this).css("display") === "none"});
                    var listHeading = allHeadings.eq(index);

                    if(listElements.length === hiddenListElements.length) {
                        listHeading.hide();
                        self.hide();
                    }
                    else {
                        listHeading.show();
                        self.show();
                    }

                });

                if (total === 0) {
                     noResultsMsg.removeClass("jsHide");
                    }
                    else {
                        noResultsMsg.addClass("jsHide");
                    }
            }

        });

        // $('ul.pagination > li > a').click(function() {
            // console.info("click");
        // });

});
