/* v.0.10.0 */
// Updated RSS implementation...
// Added checks to ensure utilities aren't run twice if script import is duplicated
// Added condition to account for $.browser being deprecated.

// UoBGlobal is used to store a reference to loaded scripts
// This can then be used to avoid running a script twice or lazy loading a script that has already been loaded.
if (typeof UoBGlobal === 'undefined') {
  UoBGlobal = {};
}

(function() {
  if (UoBGlobal.hasOwnProperty('utilities') === true) {
    console.info('utilities already loaded.');
    // don't continue if utilities are already loaded...
    return false;
  } else {
    UoBGlobal.utilities = true;

    // - - - - - UTILITY FUNCTIONS - - - - - //
    // - - - Comment parsing - - - //
    // Dynamic content can be commented out to reduce page weight.  This function is used to then extract the content
    UoBGlobal.extractContentFromComments = function(commentString, obfuscateImages) {
      obfuscateImages = typeof obfuscateImages !== 'undefined' ? obfuscateImages : false;
      // strip comment tags - can this be done more efficiently?
      commentString = commentString.replace('<!--', '');
      commentString = commentString.replace('-->', '');
      //obfuscate image source to delay image loading until they are required
      if (obfuscateImages) {
        commentString = commentString.replace(/src=\"/g, 'data-src="');
      }
      return commentString;
    };
  }

  // - - -

  $(document).ready(function() {
    var self = this;
    // If query string exists
    // Problems with GTM script adding query strings on the end of urls. Causes problems with tabs.

    if (String(window.location).split('#')[1]) {
      var anchorLink = String(window.location).split('#')[1];
      // remove GTM queryString which causes problems with tabs
      if (anchorLink.substring('&_ga')) {
        anchorLink.substring(0, anchorLink.indexOf('&_ga'));
      }
    }

    $('body').addClass('jsActive');
    var contentTabs = $('#contentTabs');

    if (contentTabs.length > 0) {
      var ctAnchorLink = anchorLink;
      // - - - LOCAL METHODS - - - //
      self.switchTabs = function(thisLink) {
        //hide the current active tab content
        var activeTab = $('.active', contentTabs);
        var activeTabContent = $(activeTab.attr('href'));

        activeTabContent.animate(
          {
            opacity: 0
          },
          150,
          'linear',
          function() {
            activeTabContent.addClass('hiddenContentTab');
            var newActiveTab = $(thisLink.attr('href'));
            newActiveTab.removeClass('hiddenContentTab');
            newActiveTab.css('opacity', 0);
            $('.active', contentTabs).removeClass('active');
            thisLink.addClass('active');

            newActiveTab.animate(
              {
                opacity: 1
              },
              250,
              'linear',
              function() {
                $(this).css('filter', 'none'); //IE horrible text fix
              }
            );
          }
        );
        // resolves issue where DOM manipulation appears to shift focus away from the desired location
        thisLink.focus();
      };
      // - - - - - - - - - - - - - - - //

      // add the class so the list is styled as tabs only when the script runs
      contentTabs.addClass('contentTabs');

      var canUseAddress = false;

      //TODO: incorporate this so address isn't used on IE7 and below
      if ($.browser) {
        // deprecated and removed in 1.9 so checking if it's available only for backwards compatibility
        var ua = $.browser;
        var safeUA = true;
        if (ua.msie && ua.version <= 7) {
          safeUA = false;
          //This browser is IE 7 or below
        }

        // if $.address functionality is available (i.e. it has been imported)

        if ($.address && safeUA) {
          $.address.strict(false);
          canUseAddress = true;
        }
      }

      var tabsList = $('li', contentTabs);
      if (tabsList.length > 0) {
        var hashIsRecognised = false;
        if (ctAnchorLink) {
          if ($('> a[href="#' + ctAnchorLink + '"]', tabsList).length > 0) {
            ctAnchorLink = '#' + ctAnchorLink;
            hashIsRecognised = true;
          } else {
            ctAnchorLink = null;
          }
        }

        // console.info("hashIsRecognised: " + hashIsRecognised);

        $('> a', tabsList).each(function(i) {
          var thisLink = $(this);
          // id matches the anchor link ;)
          var tabID = thisLink.attr('href');

          // Does the link actually go to an anchor - i.e. if not allow tab to go to external link (not recommended)
          //TODO: perhaps import external links into the tab with AJAX?
          if (tabID.charAt(0) == '#') {
            var thisTab = $(tabID);

            thisTab.addClass('contentTab');
            // hide all content except for the first or referenced tab

            if (ctAnchorLink === tabID) {
              thisLink.addClass('active');
            } else if (i === 0 && !ctAnchorLink) {
              thisLink.addClass('active');
              thisTab.removeClass('hiddenContentTab').css('opacity', 1);
              thisTab.css('filter', 'none'); //IE horrible text fix
            } else {
              // hide the content from the DOM
              thisTab.addClass('hiddenContentTab').css('opacity', 0);
            }

            thisLink.click(function(event) {
              // console.info("click");

              if (!thisLink.hasClass('active')) {
                // only update tabs here if $.address isn't available
                if (!canUseAddress) {
                  self.switchTabs(thisLink);
                  event.preventDefault();
                }
              } else {
                event.preventDefault();
              }
            }); //end: click
          } else {
            //end: if tabID[0] == "#"
            thisLink.addClass('external');
          }
        }); //end: each
      } //end: if tabsList.length>0

      // People will need to add an additional .js import for this to work...
      if (canUseAddress) {
        $.address.change(function(event) {
          var val = $.address.value();
          var update = true;

          // by default select the first tab link
          var thisLink = $('a', tabsList).eq(0);

          // except where a usable id is specified in the URL
          if (!val) {
            // don't proceed down the condition...
          } else if ($('a[href="#' + val + '"]', tabsList).length > 0) {
            // check val corresponds to a tab
            var thisLink = $('> a[href=#' + val + ']', tabsList);
          } else if ($('#' + val).length > 0) {
            // check it's not an id elsewhere on the page
            update = false;
          }

          // if the tab isn't already active
          if (!thisLink.hasClass('active')) {
            // and val doesn't correspond to an anchor link to an id elsewhere on the page
            if (update) {
              // switch tabs!
              self.switchTabs(thisLink);
            }
          }
        }); //end: address.change
      } //end: if(canUseAddress)

      // set focus to top of page
      if (hashIsRecognised) {
        $(window).scrollTop(0);
        $('a')
          .eq(1)
          .focus();
      }
    } //end: if(contentTabs)

    // console.info("utilities still running...");

    // - - - ACCORDION - - - //

    $('.expandableLinksList').each(function() {
      var thisLinkList = $(this);
      $('.sublist').hide();

      //self.children('li').addClass('list-heading'); // why? Possibly to make it work on Library site :/

      var links = $('.list-heading > a', this);

      links.click(function(event) {
        var clickedLink = $(this);

        $('ul:visible', thisLinkList).slideUp(600);
        // show the requested list if it isn't already visible
        // This works because the previous hide command won't have completed when
        // this is called so at this point the sublist is still considered 'visible'
        if (clickedLink.next('ul:visible', thisLinkList).length <= 0) {
          clickedLink.next('ul').slideDown(600);
        }
        event.preventDefault();
      });
    });

    // - - - RSS FEEDS - - - //

    // requires import of jquery.zrssfeed.min.js
    $('.rssFeed').each(function(e) {
      var feedLink = $(this);
      var numOverride = String(feedLink.attr('class')).match(/_n(?=([0-9]*))/);
      var showHeader = String(feedLink.attr('class')).match('_noHeader') ? false : true;
      var showDesc = String(feedLink.attr('class')).match('_noDesc') ? false : true;
      var showSnippet = String(feedLink.attr('class')).match('_fullText') ? false : true;
      var requireSSL = String(feedLink.attr('class')).match('_secure') ? true : false;
      // If header is to be displayed check for title attribute to use as override
      if (showHeader) {
        var newHeader = feedLink.attr('title') ? feedLink.attr('title') : false;
      }

      var numStories = numOverride && numOverride[1] !== '' ? Number(numOverride[1]) : 5;
      var URL = String(feedLink.attr('href'));

      // Not reliable enough at present...
      // add timestamp to URL to avoid cacheing
      //~ var now = new Date().getTime();
      //~ if(URL.indexOf("?") != -1) {
      //~ URL = feedLink.attr('href')+ "&a=" + now;
      //~ }
      //~ else {
      //~ URL = feedLink.attr('href')+ "?a=" + now;
      //~ }
      //~ log(URL);

      var feedDiv = $('<div class="zrssFeedEmbed" id="rssFeed' + e + '"></div>');
      feedLink.replaceWith(feedDiv);

      // implement zrssfeed request
      feedDiv.rssfeed(
        URL,
        {
          limit: numStories,
          header: showHeader,
          content: showDesc,
          snippet: showSnippet,
          dateformat: 'date',
          ssl: requireSSL
        },
        function() {
          if (showHeader && newHeader) {
            $('.rssHeader > a', feedDiv).html(newHeader);
          }
          if (!showSnippet) {
            feedDiv.removeClass('rssFeed').addClass('rssFullText');
          }
        }
      );
    }); // end RSSfeed.each()

    var months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];

    // - - - UoB DOMAIN ONLY RSS FEEDS - - - //
    $('.rssiFeed').each(function(index) {
      var feedLink = $(this),
        // OPTIONS
        numOverride = String(feedLink.attr('class')).match(/_n(?=([0-9]*))/),
        showDesc = String(feedLink.attr('class')).match('_showDesc') ? true : false,
        showSource = String(feedLink.attr('class')).match('_showSource') ? true : false,
        isEvents = String(feedLink.attr('class')).match('_events') ? true : false,
        // showSnippet = String(feedLink.attr("class")).match("_fullText") ? false : true, //TODO: is this still required?
        numStories = numOverride && numOverride[1] !== '' ? Number(numOverride[1]) : 5,
        additionalFeedURLs = feedLink.attr('data-additionalfeeds'),
        //take into account empty or non-existent data-additionalfeeds
        allFeeds = additionalFeedURLs ? additionalFeedURLs.split(',') : [];

      // include the main feed URL
      allFeeds.push(String(feedLink.attr('href')));

      feedLink.addClass('contentPending');

      //TODO: we could de-dupe feed URLS here to avoid wasted requests...
      var allFeedsLength = allFeeds.length;

      // set up ajax requests
      var requests = [];

      for (var i = 0; i < allFeedsLength; i++) {
        var url = allFeeds[i];
        var thisRequest = $.ajax({
          url: url,
          dataType: 'xml',
          success: function(data) {
            // return(data);
          },
          error: function(a, b, c) {
            console.error('unable to load feed: ' + url);
          }
        });

        requests.push(thisRequest);
      }

      // This approach to deferred action on completion of requests taken from:
      // http://stackoverflow.com/questions/14465177/multiple-ajax-calls-wait-for-last-one-to-load-then-execute
      $.when.apply(this, requests).done(function() {
        // containers to store retrieved data
        var allResponses = [],
          items = [];

        // arguments contains the result of the request
        for (var i = 0; i < arguments.length; i++) {
          if (arguments[i][0] !== undefined && arguments[i][1] === 'success') {
            var XML = $.parseXML(arguments[i][2].responseText);
            allResponses.push(XML);
          } else if (arguments[i] !== undefined) {
            // handle only a single feed request
            var XML = $.parseXML(arguments[2].responseText);
            allResponses.push(XML);
            break;
          }
        }

        // get item data
        $(allResponses)
          .find('channel')
          .each(function(index) {
            var channel = $(this),
              sourceTitle = channel.find('title:first').text(),
              sourceLink = channel.find('link:first').text();

            channel.find('item').each(function(index) {
              var rawItem = $(this),
                item = {
                  title: rawItem.find('title').text(),
                  desc: rawItem.find('description').text(),
                  link: rawItem.find('link').text(),
                  category: rawItem.find('category').text(),
                  date: new Date(rawItem.find('pubDate').text()),
                  source: sourceTitle,
                  sourceLink: sourceLink
                };

              items.push(item);
            });
          });

        items.sort(function(a, b) {
          if (isEvents) {
            return a.date - b.date;
          } else {
            return b.date - a.date;
          }
        });

        var itemsLength = items.length,
          counter = 0,
          output = $('<ul class="rssInclude list-no-style" id="rssInclude' + index + '">'),
          previousItem;

        // only add events class if link explicitly marked as being events
        if (isEvents) {
          output.addClass('list-events');
        } else {
          output.addClass('list-news');
        }

        for (var i = 0; i < itemsLength; i++) {
          var item = items[i];
          var itemDate = item.date;
          // check if this item duplicates the previous
          if (i > 0) {
            if (item.title === previousItem.title && itemDate.getTime() === previousItem.date.getTime()) {
              // This item has already been output; so skip it...
              continue;
            }
          }
          // now store current item for purposes of comparison on the next loop
          var previousItem = items[i],
            // containers for element output
            listElement,
            itemOutput = '';

          if (isEvents) {
            // start by checking if the event is current
            var today = new Date(new Date().setHours(0, 0, 0, 0));
            // skip events that have already passed
            if (itemDate.getTime() < today.getTime()) {
              continue;
            }

            listElement = $('<li class="events-listing-item">');
            itemOutput =
              '<p class="event-date"><span class="event-day">' +
              itemDate.getDate() +
              ' </span>' +
              '<span class="event-month">' +
              months[itemDate.getMonth()] +
              ' </span>' +
              '<span class="event-year">' +
              itemDate.getFullYear() +
              ' </span></p>' +
              '<p class="event-title"><a href="' +
              item.link +
              '">' +
              item.title +
              '</a></p>';
            if (showDesc) {
              itemOutput += '<p class="event-abstract">' + item.desc + '</p>';
            }
          } else {
            listElement = $('<li class="news-listing-story">');
            itemOutput =
              '<a href="' +
              item.link +
              '"><span class="news-title">' +
              item.title +
              '</span></a> ' +
              '<span class="news-date weak">' +
              itemDate.getDate() +
              ' ' +
              months[itemDate.getMonth()] +
              ' ' +
              itemDate.getFullYear() +
              '</span>';
            if (showDesc) {
              itemOutput += '<div>' + item.desc + '</div>';
            }
          }

          listElement.append(itemOutput);

          if (showSource) {
            listElement.append(
              '<span class="source"><a href="' + item.sourceLink + '">' + item.source + '</a></span>'
            );
          }
          output.append(listElement);
          counter++;

          // finish the loop if the set number of stories have been output
          if (counter === numStories) {
            break;
          }
        }

        //TODO: handle different types of feed (i.e. news AND events)...
        // feedDiv.append(output);
        feedLink.replaceWith(output);
      });
    }); // end RSSfeed.each()

    // - - - DROPDOWNS - - - //

    //TODO: any optimisation possible?
    var dropDownMenus = $('.drop-down-menu');
    if (dropDownMenus.length > 0) {
      // console.info("drop downs found");

      dropDownMenus.each(function(i) {
        var thisDropDown = $(this);

        // console.info(thisDropDown);

        if (!thisDropDown.attr('id')) {
          thisDropDown.attr('id', 'drop-down-' + (i + 1));
        }
        //TODO: should we also include a class in the following that can be applied to an arbitrary element to use as a drop-down 'heading'?
        var headings = thisDropDown.children('h2, h3, h4, h5, h6').not('.dropdown-ignore'); // Assume top level headings are used for expand/collapse block

        headings.each(function(j) {
          var thisHeading = $(this);
          thisHeading.addClass('drop-down-header');
          // Automatically generate logical IDs where none has been applied in the HTML
          if (!thisHeading.attr('id')) {
            thisHeading.attr('id', 'dropdown-heading' + i + '-' + j);
          }

          thisHeading.wrapInner('<a href="#' + thisHeading.attr('id') + '"></a>');
          //Process the content block associated with this heading
          var dropDownContentBlock = thisHeading.next('div'); //Note that it's assumed the content block is the next <div>
          dropDownContentBlock.addClass('drop-down-content content-padding'); //No need to manually add '.drop-down-content' class to elements

          if (anchorLink !== thisHeading.attr('id')) {
            dropDownContentBlock.hide();
          } else {
            thisHeading.addClass('active');

            if (contentTabs) {
              var parentTabId = '#' + thisDropDown.parents('.contentTab').attr('id');
              var contentTabLink = $('a[href="' + parentTabId + '"]', '#contentTabs');
              if (contentTabLink.length > 0) {
                self.switchTabs(contentTabLink);
              }
            }
          }

          // Check whether this is a nested drop-down and add convenient styles where appropriate
          var depth = thisHeading.parents('.drop-down-menu').length - 1;
          if (depth > 0) {
            thisDropDown.addClass('drop-down-child drop-down-level' + depth);
            //Expand parents of an element where it is referenced in the URL #
            if (anchorLink === thisHeading.attr('id')) {
              //TODO: would look better if called recursively...
              thisDropDown
                .parents('.drop-down-content:hidden')
                .show(500)
                .prev('.drop-down-header')
                .addClass('active');
            }
          }
        }); //end headings.each()

        // Method for collapsing siblings/children
        var collapseContentBlock = function(dropDownContentBlock) {
          dropDownContentBlock
            .find('.drop-down-content:visible')
            .slideUp('slow')
            .removeClass('active');
          dropDownContentBlock.find('.drop-down-content:hidden').hide(); //looks silly doesn't it?  But an element can be expanded in a drop-down which itself is collapsed
          dropDownContentBlock.find('.drop-down-header, .active').removeClass('active');
        };

        // Using a single click event handler for added efficiency
        thisDropDown.click(function(e) {
          // console.info("click");

          // The user might click either on the <a> or on the header element that contains it... or on some arbitrary element within the header element :/
          var clickedHeading = $(e.target).hasClass('drop-down-header')
            ? $(e.target)
            : $(e.target).parentsUntil('.drop-down-menu', '.drop-down-header');
          // Only respond to clicks on a header
          if (clickedHeading.length > 0) {
            var dropDownContentBlock = clickedHeading.next('div');

            if (dropDownContentBlock.is(':hidden')) {
              dropDownContentBlock.slideDown('slow');
              clickedHeading.addClass('active');

              if (!thisDropDown.hasClass('ignore-siblings')) {
                dropDownContentBlock.siblings('.drop-down-content:visible').slideUp('slow');
                headings.not(clickedHeading).removeClass('active');

                if (thisDropDown.hasClass('collapse-children')) {
                  collapseContentBlock(dropDownContentBlock.siblings('.drop-down-content').children());
                }
              }
            } else {
              dropDownContentBlock.slideUp('slow');
              clickedHeading.removeClass('active');
              //Optionally close child drop downs
              if (thisDropDown.hasClass('collapse-children')) {
                collapseContentBlock(dropDownContentBlock);
              }
            }
            e.stopPropagation(); // stop event bubbling up
            e.preventDefault(); //prevent link behaviour
          }
        }); //end: dropDown.click

        // remove back to top links from drop-down-content only
        //TODO: maybe this should also be applied to tabs?
        $('.btop', '.drop-down-content')
          .parent('.screen')
          .each(function() {
            $(this).css('display', 'none');
          });
      }); //end: dropDown.each()

      // Need to loop separately to see the results of the previous loop on ALL dropdowns
      dropDownMenus.each(function(i) {
        var thisDropDown = $(this);
        // Check no dropdowns are already expanded either in this dropdown or any nested dropdowns
        if (
          thisDropDown.hasClass('expand-first') &&
          thisDropDown.find('.drop-down-header.active').length == 0
        ) {
          var firstDropDown = thisDropDown.children('h2, h3, h4, h5, h6').first();
          firstDropDown.addClass('active');
          firstDropDown.next('div').show(500);
        }
      });

      if (anchorLink) {
        var offset = $('#' + anchorLink).offset();
        $(window).scrollTop(offset.top);
      }
    } //end: if dropDownMenus...
  });
})();

// DO NOT REMOVE
// Used on: http://www.bristol.ac.uk/study/undergraduate/search/
/**
 * fastLiveFilter jQuery plugin 1.0.3
 *
 * Copyright (c) 2011, Anthony Bush
 * License: <http://www.opensource.org/licenses/bsd-license.php>
 * Project Website: http://anthonybush.com/projects/jquery_fast_live_filter/
 **/

jQuery.fn.fastLiveFilter = function(e, t) {
  (t = t || {}), (e = jQuery(e));
  var n,
    l = this,
    i = '',
    o = t.timeout || 0,
    a = t.callback || function() {},
    s = e.children(),
    r = s.length,
    c = r > 0 ? s[0].style.display : 'block';
  return (
    a(r),
    l
      .change(function() {
        for (var e, n, i = l.val().toLowerCase(), o = 0, y = 0; r > y; y++)
          (e = s[y]),
            (n = t.selector
              ? $(e)
                  .find(t.selector)
                  .text()
              : e.textContent || e.innerText || ''),
            n.toLowerCase().indexOf(i) >= 0
              ? ('none' == e.style.display && (e.style.display = c), o++)
              : 'none' != e.style.display && (e.style.display = 'none');
        return a(o), !1;
      })
      .keydown(function() {
        clearTimeout(n),
          (n = setTimeout(function() {
            l.val() !== i && ((i = l.val()), l.change());
          }, o));
      }),
    this
  );
};
