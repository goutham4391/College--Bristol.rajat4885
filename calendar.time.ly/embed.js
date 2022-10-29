( function () {
    'use strict';
    // Script needs to support IE11 - i.e. es5 features only
    function getDocumentBody() {
        if ( !document.getElementsByTagName( 'body' ).length ) {
            var div = document.createElement( 'div' );
            var bodyElement = document.createElement( 'body' );
            document.body = bodyElement;
            div.innerHTML = 'Please ensure to place the embed script inside an html body tag';
            document.body.appendChild( div );
            return true;
        }
        return false;
    }

    function insertElement( str, element ) {
        var div = document.createElement( 'div' );
        div.innerHTML = str;
        if ( element ) {
            element.parentNode.insertBefore( div, element );
        } else {
            document.body.appendChild( div );
        }
    }

    // Add embedded button styles
    function embeddedButtonStyles( stylesheet ) {
        stylesheet += '\n.timely-embedded-fes-btn {' +
                      ' color: #8089a7;' +
                      ' background-color: transparent;' +
                      ' padding:5px;' +
                      ' font-size: 14px;' +
                      ' border-radius: 5px;' +
                      ' border: 1px solid #8089a7;' +
                      ' display: inline-block;' +
                      ' font-family: Sans-serif;' +
                      ' width: -webkit-fit-content;' +
                      ' width: -moz-fit-content;' +
                      ' width: fit-content;' +
                      ' text-align: center;' +
                      ' text-transform: uppercase;' +
                      ' cursor: pointer;' +
                      '}\n';
        return stylesheet;
    }

    // Add iFrame styles
    function iFrameStyles( stylesheet ) {
        stylesheet += '\n.timely-frame {' +
                      ' display: block;' +
                      ' position: relative;' +
                      ' width: 100%;' + // TODO: use vw units
                      ' border: none;' +
                      ' margin: 0px auto;' +
                      ' transition: none;' +
                      '}\n';

        stylesheet += '\n.timely-frame:not(.timely-slider) {' +
                      ' height: 400px;' +
                      '}\n';
        return stylesheet;
    }

    // Add event details styles
    function eventDetailsStyles( stylesheet ) {
        stylesheet += '\n.timely-iframe-popup-container {' +
                      ' display: none;' +
                      ' position: fixed;' +
                      ' left: 0;' +
                      ' top: 0;' +
                      ' width: 100vw;' +
                      ' z-index: 100000;' +
                      ' text-align: center;' +
                      ' overflow-y: auto;' +
                      ' -webkit-overflow-scrolling: touch;' +
                      ' background: rgba(0,0,0,0.5);' +
                      ' scrollbar-width: none;' + // Firefox and IE
                      '}\n';

        stylesheet += '\n.timely-iframe-popup-container::-webkit-scrollbar {' +
                      ' display: none;' + // Chrome and Safari
                      '}\n';

        // !important required to prevent WP themes from overriding iFrame styles for ED popup
        // https://wordpress.org/support/topic/issue-with-iframes-that-are-hidden-on-page-load/
        stylesheet += '\n.timely-iframe-popup {' +
                      ' width: 100vw !important;' +
                      ' height: 100vh;' +
                      ' margin: 0px auto;' +
                      ' padding: 0px;' +
                      ' border: none;' +
                      ' overflow: hidden;' +
                      '}\n';

        return stylesheet;
    }

    function clearFilterParams( src, paramsRegex ) {
        for ( let filter in paramsRegex ) {
            if (
                location.hash.match( paramsRegex[filter] ) &&
                src.match( paramsRegex[filter] )
            ) {
                src = src.replace( paramsRegex[filter], '' );
            }
        }

        return src;
    }

    function addFilterParams( paramsRegex ) {
        var params = '';
        var filters = {}

        for ( let filter in paramsRegex ) {
            filters[filter] = location.hash.match( paramsRegex[filter] );
        }

        for ( let filter in filters ) {
            if ( location.hash.match( paramsRegex[filter] ) && src.match( paramsRegex[filter] ) ) {
                src = src.replace( paramsRegex[filter], '' );
            }

            if ( filters[filter] && filters[filter].length ) {
                params += '&' + filters[filter][0];
            }
        }
        return params;
    }

    /* Check to ensure script is inside html body */
    if ( getDocumentBody() ) {
        return;
    }

    var timely_script = document.querySelector( '#timely_script' );

    if ( timely_script ) {
        var src = timely_script.getAttribute( 'data-src' );
        var embeddedFES = timely_script.getAttribute( 'data-fes' );
        var accessToken = timely_script.getAttribute( 'data-access-token' );
        var eventId = location.hash.match( /^#event=(\d+)(?=;instance|$)/ );
        var eventSlug = location.hash.match( /^#event=([a-z0-9-_]+)/ );
        var popup = location.href.match( /(\?|&)(popup=[1])/ );
        var customLang = src.match( /(\?|&)(lang=[a-z]{2}-[A-Z]{2})/ );

        /* Automatically open ED of the specified event */
        if ( eventId || eventSlug ) {
            // Open ED.
            var s = src.split( '?' )[0];
            if ( s.indexOf( '.time.ly' ) === -1 &&
                 s.indexOf( '.timely.fun' ) === -1 &&
                 s.indexOf( 'localhost' ) === -1
            ) {
                while ( s.lastIndexOf( '/' ) > 9 ) {
                    s = s.substr( 0, s.lastIndexOf( '/' ) );
                }
            }

            if ( s.lastIndexOf( '/' ) > -1 &&
                 s.lastIndexOf( '/' ) === s.length - 1
            ) {
                s = s.substr( 0, s.length - 1 );
            }
            s += '/event/' + ( eventId ? eventId[1] : eventSlug[1] );

            var instanceHash = location.hash.match( /;instance=(\d+)/ );
            if ( instanceHash ) {
                s += ( eventId ? '/' : '?instance_id=' )  + instanceHash[1];
            }

            if ( customLang ) {
                s += ( s.indexOf( '?' ) > -1 ? '&' : '?' ) + customLang[2];
            }

            if ( popup ) {
                s += ( s.indexOf( '?' ) > -1 ? '&' : '?' ) + 'popup=1';
            }

            var requestToken = location.hash.match( /requestToken=[a-z0-9-_]+/ );
            if ( requestToken && requestToken.length > 0 ) {
                s += ( s.indexOf( '?' ) > -1 ? '&' : '?' ) + requestToken[0];
            }

            if ( accessToken ) {
                s += ( s.indexOf( '?' ) > -1 ? '&' : '?' ) + 'access_token=' + accessToken;
            }

            setTimeout( function () {
                window.postMessage( {
                    timelyFrame: timely_script.id + '-details',
                    timelyEventDetailsUrl: s,
                }, '*' );

                window.addEventListener( 'keydown' , ( event ) => {
                    if ( event.code === 'Tab' ) {
                        window.postMessage( {
                            timelyFrame: timely_script.id,
                            timelyFocusEvent: 1
                        }, '*' );
                    }
                } )

            }, 500 );


        }

        /* Change id of the script so we won't initialize it again */
        const initializedEmbeds = document.querySelectorAll( 'iframe[id^="timely-iframe-embed-"]' ).length;
        timely_script.id = 'timely-iframe-embed-' + initializedEmbeds.toString();
        src += ( src.indexOf( '?' ) > -1 ? '&' : '?' ) + 'timely_id=' + timely_script.id;

        // Check if we had a login using SSO. If we had, the Saml will return a requestToken in the client's URL
        var clientLocation = new URL( top.window.location.href );
        var requestTokenParam = clientLocation.searchParams.get( 'requestToken' );
        if ( requestTokenParam ) {
            // We need to append the requestToken from Saml to the iframe source, so we can perform the login via Saml
            src += ( src.indexOf( '?' ) > -1 ? '&' : '?' ) + 'requestToken=' + requestTokenParam;
            // Update client's page URL to don't show the requestToken sent by Saml
            clientLocation.searchParams.delete( 'requestToken' );
            top.window.history.replaceState( null, null, clientLocation.href );
        }

        // When using SSO, a state is used to know if the action was triggered by the FES button
        var state = clientLocation.searchParams.get( 'state' );
        if ( state ) {
            src += ( src.indexOf( '?' ) > -1 ? '&' : '?' ) + 'state=' + state;
            clientLocation.searchParams.delete( 'state' );
            top.window.history.replaceState( null, null, clientLocation.href );
        }

        if ( accessToken ) {
            src += ( src.indexOf( '?' ) > -1 ? '&' : '?' ) + 'access_token=' + accessToken;
            clientLocation.searchParams.delete( 'access_token' );
            top.window.history.replaceState( null, null, clientLocation.href );
        }

        if ( embeddedFES ) {
            // Add embedded FES button
            insertElement( '<button type="button" class="timely-embedded-fes-btn" onclick="window.timelyOpenPopup(\'' +
                src + '\')">' + embeddedFES + '</button>', timely_script );
        } else {
            // TODO: remove use of scrolling attribute, deprecated attribute
            const isTop = window.top === window.self;
            const iFrameName = timely_script.id;
            const isSlider = src.indexOf( 'slider' ) > -1;
            const iFrameClass = 'timely-frame' + ( isSlider ? ' timely-slider' : '' );

            let iFrameStyle = '';
            const maxHeight = timely_script.getAttribute( 'data-max-height' );
            const width = timely_script.getAttribute( 'data-width' );
            if ( maxHeight > 0 || width ) {
                iFrameStyle += 'style="';
                if ( maxHeight > 0 ) {
                    iFrameStyle += 'max-height:' + maxHeight + 'px;';
                }
                if ( width ) {
                    iFrameStyle += 'width:' + width + ';';
                }
                iFrameStyle += '"';
            }

            const paramsRegex = {
                // Format: YYYY-MM-DD
                startDate: /start_date=(\d\d\d\d-\d\d-\d\d)/ ,
                endDate: /end_date=(\d\d\d\d-\d\d-\d\d)/ ,
                // Format: 123 or 123,124,125
                categories: /categories=((\d+),?)+/ ,
                tags: /tags=((\d+),?)+/ ,
                venues: /venues=((\d+),?)+/ ,
                organizers: /organizers=((\d+),?)+/ ,
                filterGroups: /filter_groups=((\d+),?)+/ ,
                filterGroupsByIds: /filter_groups_?\d+?=((\d+),?)+/ ,
                // Format: 123-12345 or 123-12345,222-222 (event id - instance id)
                ids: /ids=((\d+-\d+),?)+/
            };

            src = clearFilterParams( src, paramsRegex );
            src += addFilterParams( paramsRegex );

            // Add main calendar frame
            insertElement( '<iframe id="' + iFrameName + '" title="' + iFrameName + '" name="' + iFrameName +
                '" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-pointer-lock ' +
                'allow-same-origin allow-scripts allow-top-navigation allow-downloads" scrolling="' +
                ( isTop ? 'no' : 'yes' ) + '" src="' + src + '" class="' + iFrameClass + '" ' + iFrameStyle + '></iframe>', timely_script );
        }
    }

    // Add common CSS and iframe for ED just once
    if ( !window.timelyPopupInitialized ) {
        window.timelyPopupInitialized = true;
        const eventiFrameName = timely_script.id + '-event-popup';
        insertElement( '<div class="timely-iframe-popup-container" onclick="window.timelyClosePopup()">\
                            <iframe class="timely-iframe-popup" src="about:blank" id="' + eventiFrameName +
                            '" name="'+ eventiFrameName +'" title="'+ eventiFrameName +'" ' +
                            'sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-pointer-lock ' +
                            'allow-same-origin allow-scripts allow-top-navigation allow-downloads"></iframe>\
                        </div>', null );

        // Add CSS
        var stylesheet = '';
        stylesheet = embeddedButtonStyles( stylesheet );
        stylesheet = iFrameStyles( stylesheet );
        stylesheet = eventDetailsStyles( stylesheet );

        if ( document.getElementsByTagName( 'head' ).length ) {
            var styleElement = document.createElement( 'style' );
            styleElement.type = 'text/css';

            if ( styleElement.styleSheet ) {
                styleElement.styleSheet.cssText = stylesheet;
            } else {
                styleElement.appendChild( document.createTextNode( stylesheet ) );
            }

            document.head.appendChild( styleElement );
        } else {
            insertElement( '<style>' + stylesheet + '</style>', timely_script );
        }

        window.addEventListener( 'message', function ( triggeredEvent ) {
            var message = JSON.parse( JSON.stringify( triggeredEvent.data ) );
            var iFrame = document.querySelector( '.timely-frame:not(.timely-slider)' );

            if ( message.height && document.getElementById( message.timelyFrame ) ) {
                document.getElementById( message.timelyFrame ).style.height = 'calc(' + message.height + ')';
            }

            if ( message.timelyFrame && window.frames[message.timelyFrame] ) {
                window.frames[message.timelyFrame].postMessage( {
                    topWindow: location.href
                }, '*' );
            }

            if ( message.timelyFrame && window.frames[message.timelyFrame + '-event-popup'] ) {
                window.frames[message.timelyFrame + '-event-popup'].postMessage( {
                    topWindow: location.href
                }, '*' );
            }

            if ( message.urlUpdates && document.getElementsByClassName( 'timely-script' ).length == 1 ) {
                window.history.pushState( {}, '', '#' + unescape( message.urlUpdates ) );
            }

            if ( message.timelyFilters ) {
                if ( iFrame.id ) {
                    window.frames[iFrame.id].postMessage( {
                        timelyFilters: message.timelyFilters
                    }, '*' );
                }
            }

            if ( message.timelyLoggedInUserData ) {
                if ( iFrame.id ) {
                    window.frames[iFrame.id].postMessage( {
                        timelyLoggedInUserData: message.timelyLoggedInUserData
                    }, '*' );
                }
            }

            if ( message.timelySignOut ) {
                if ( iFrame.id ) {
                    window.frames[iFrame.id].postMessage( {
                        timelySignOut: 1
                    }, '*' );
                }
            }

            if ( message.timelyEventDetailsUrl ) {
                var iFrameUrl = message.timelyEventDetailsUrl +
                    ( message.timelyEventDetailsUrl.indexOf( '?' ) > -1 ? '&' : '?' ) +
                    'timely_id=' + message.timelyFrame + '-event-popup';
                if ( accessToken ) {
                    iFrameUrl += '&access_token=' + accessToken;
                }
                if ( document.querySelector( '.timely-iframe-popup' ).src !== iFrameUrl ) {
                    if( message.timelyDisplayPreference === 'popup' ) {
                        window.timelyOpenPopup( iFrameUrl );
                    } else if ( message.timelyDisplayPreference === 'new_tab' ) {
                        window.open( message.timelyUrlFragment, '_blank' );
                        return;
                    } else if ( message.timelyDisplayPreference === 'same_page' ) {
                        window.timelyOpenEvent( iFrameUrl, message.timelyFrame );
                        return;
                    }

                    if( !( 'timelyDisplayPreference' in message ) ) {
                        window.timelyOpenPopup( iFrameUrl );
                    }

                    /*
                    By passing timelyUrlFragment, we ask the parent frame to change it's location fragment.
                    When an event with a timelyUrlFragment is shared or re-opened, it will display the ED when loaded.
                    */

                    if ( message.timelyUrlFragment ) {
                        window.history.pushState(
                            {},
                            '',
                            location.pathname + unescape( message.timelyUrlFragment )
                        );
                    }

                }
            }

            if ( message.timelyClosePopup ) {
                window.timelyClosePopup();
            }

            if ( message.timelyFocusEvent ) {
                if ( message.timelyFrame && window.frames[message.timelyFrame+'-event-popup'] ) {
                    window.frames[message.timelyFrame+'-event-popup'].postMessage( {
                        focusEvent: 1
                    }, '*' );
                }
            }

        }, false );

        // Send scroll events to the frame for the lazy load.
        var timely_scroll;

        window.addEventListener( 'scroll', function () {

            if ( !document.querySelector( '.timely-frame:not(.timely-slider)' ) ||
                 document.querySelector( '.timely-frame:not(.timely-slider)' ).src.indexOf( '&range=today' ) > -1 ||
                 timely_scroll
            ) {
                return;
            }

            timely_scroll = setTimeout( function () {
                var scroll = (
                    document.documentElement &&
                    document.documentElement.scrollTop
                ) || document.body.scrollTop;

                if ( scroll > document.body.offsetHeight / 2 - window.innerHeight ) {
                    var f = document.querySelector( '.timely-frame:not(.timely-slider)' ).id;
                    window.frames[f].postMessage( {
                        loadMore: 1
                    }, '*' );
                }

                setTimeout( function () {
                    timely_scroll = null;
                }, 500 );
            }, 50 );

        }, false );

        // Store the default body overflow style for restoring when ED is closed.
        var defaultBodyOverflow = window.getComputedStyle( document.body ).getPropertyValue( 'overflow' );

        // Open popup
        window.timelyOpenPopup = function ( iFrameUrl ) {
            document.querySelector( '.timely-iframe-popup-container' ).style.display = 'block';
            document.querySelector( '.timely-iframe-popup' ).src = iFrameUrl;

            // Disable / Hide scrollbar of the main page when ED is open.
            document.body.style.overflow = 'hidden';
        };

        // Open event
        window.timelyOpenEvent = function ( iFrameUrl, iFrameName ) {
            document.getElementById( iFrameName ).src = iFrameUrl;
        };

        // Close popup
        window.timelyClosePopup = function () {
            document.querySelector( '.timely-iframe-popup-container' ).style.display = 'none';
            document.querySelector( '.timely-iframe-popup' ).src = 'about:blank'; // Hide popup iFrame

            /* Remove url fragment without causing page to jump */
            history.pushState(
                '',
                document.title,
                window.location.pathname + window.location.search
            );

            // Restore the body overflow style
            document.body.style.overflow = defaultBodyOverflow;
        };
    }

} )();
