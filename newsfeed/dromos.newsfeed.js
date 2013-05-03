/*====================================
Newsfeed control for the dromos js library

====================================*/
define(["jquery", "jqueryui"], function($jQ)
{
    $jQ.widget('dromos.newsfeed', 
    {
        // defaults here are for twitter
        options : {
            feed : "http://search.twitter.com/search.json?q=",
            clearElement : false,
            query : "#dromos",
            method : "POST",
            callbackMarker : "callback=?",
            feedElement : ".feed",
            refreshRate : 10000,
            errorRate : 15000,
            maxResults : 5,
            loaderGif : "/images/icons/ajax-loader.gif",
            initialData : null,
            delay : 0,
            onUpdateComplete : function(){},
            process : function(toItem, toResult){return toItem},
            extractResultArray : function(toResults){return toResults && toResults['results'] ? toResults['results'] : []},
            extractKey : function(toItem){return toItem['id']},
            extractSequence : function(toItem){return Date.parse(toItem['created_at'])},
            extractImageURL : function(toItem){return toItem['profile_image_url']},
            extractTitle : function(toItem){return toItem['from_user_name']},
            extractText : function(toItem){return toItem['text']},
            extractSubtext : function(toItem){return ''},
            extractTime: function(toItem){return Date.parse(toItem['created_at'])},
            createTemplate: function(toItem){return "<div class=\"feedItem\">" +
                                    "<img src=\"" + toItem.image + 
                                            "\" title=\"" + toItem.title + "\"/>" +
                                    "<article>" +
                                        "<label>"+ toItem.title + " says:</label>" +
                                        "<span>"+ toItem.text + "</span>" +
                                        "<aside class=\"time\">"+ this.parseTime(toItem.time) + "</aside>" + 
                                    "</article>" +
                                "</div>"},
            update : function(){this._update();},
            parseTime : function(tnTime)
            {
                var ldTime = tnTime;
                ldTime = Math.ceil((new Date() - ldTime)/1000/60);
                // TODO: Make this a framework function
                if (ldTime == 1)
                {
                    ldTime = "less than a minute ago";
                }
                else if (ldTime < 2)
                {
                    ldTime = ldTime + " minute ago";
                }
                else if (ldTime < 60)
                {
                    ldTime = ldTime + " minutes ago";
                }
                else
                {
                    // Hours
                    ldTime = Math.floor(ldTime/60);
                    if (ldTime < 1)
                    {
                        ldTime = "less than an hour ago";
                    }
                    else if (ldTime == 1)
                    {
                        ldTime = ldTime + " hour ago";
                    }
                    else if (ldTime < 24)
                    {
                        ldTime = ldTime + " hours ago";
                    }
                    else
                    {
                        ldTime = "more than a day ago";
                    }
                }
                return ldTime;
            },

            sort : function(toA, toB){return toA.time - toB.time;}
        },
        _create : function()
        {
            this._feedReel=this.element.find(this.options.feedElement);
            this._first = true;
            this._feedReel.css(
                    {
                        "background-image" : "url('" + this.options.loaderGif + "')",
                        "background-repeat" : "no-repeat",
                        "background-position" : "center"});

            this._keyList = [];
            this._itemList = [];
            window.setTimeout(dromos.utilities.createCallback(
                    function()
                    {
                        if (this.options.initialData === null)
                        {
                            this._refresh(this.options.refreshRate);
                        }
                        else
                        {
                            if (this.options.initialData.result)
                            {
                                this.options.initialData = this.options.initialData.result;
                            }
                            this._onSuccessCallback(this.options.refreshRate);
                        }
                    }, this), this.options.delay);
        },
        _getPlaceHolder : function()
        {
            if (!this._placeHolder)
            {
                this._placeHolder = $jQ("<div><label>It appears the feed is disconnected.  We will keep trying.</label></div>").css({
                    "border" : "1px solid red",
                    "background" : "pink",
                    "padding" : "5em",
                    "opacity" : 0
                });
            }
            return this._placeHolder;
        },
        _refresh : function(tnRate)
        {
            var lcQuery = (dromos.utilities.isType(this.options.query, 'String') ?
                             encodeURIComponent(this.options.query) : '');
            $jQ.ajax(
                {
                    type: this.options.method,
                    url: this.options.feed + lcQuery + (this.options.feed.indexOf('?') >= 0 ? '&' : '?' ) + this.options.callbackMarker,
                    dataType: 'json',
                    data : this.options.query == null ? null : !dromos.utilities.isType(this.options.query, 'String') ?
                        this.options.query : null,
                    timeout: 5000,
                    success : dromos.utilities.createCallback(
                        function(toData)
                        {
                            this._onSuccessCallback(toData);
                        }, this),
                    error : dromos.utilities.createCallback(
                        function(toData, tcStatus, toError)
                        {
                            console.error(toError);

                            if (this._feedReel.parents(document).length >0)
                            {
                                var loPlaceHolder = this._getPlaceHolder();
                                this._feedReel.fadeTo('slow', 0, dromos.utilities.createCallback(function()
                                {
                                    this._feedReel.replaceWith(loPlaceHolder);
                                    loPlaceHolder.fadeTo('slow', .75);
                                }, this));
                            }
                            this.start(this.options.errorRate);
                        }, this)
                });
        },
        _onSuccessCallback : function(toData)
        {
            if (this._feedReel.parents(document).length == 0)
            {
                var loPlaceHolder = this._getPlaceHolder();
                loPlaceHolder.fadeTo('slow', 0, dromos.utilities.createCallback(function()
                {
                    loPlaceHolder.replaceWith(this._feedReel);
                    this._feedReel.fadeTo('slow', 1);
                }, this));
            }

            if (this._first)
            {
                this._first = false;
                this._feedReel.css({"background-image" : "none"});
            }
            this._parseRawFeed(toData);
            this.start(this.options.refreshRate);
        },
        _parseRawFeed : function(toRaw)
        {
            var laResults = this.options.extractResultArray(toRaw);
            var laNewsItems = [];
            var i, lnLength;
            for(i=0, lnLength = laResults.length; i<lnLength; i++)
            {
                var loResult = laResults[i]; 
                laNewsItems[laNewsItems.length] = this.options.process({
                    key : this.options.extractKey(loResult),
                    sequence : this.options.extractSequence(loResult),
                    image : this.options.extractImageURL(loResult),
                    title : this.options.extractTitle(loResult),
                    text : this.options.extractText(loResult),
                    subtext : this.options.extractSubtext(loResult),
                    time : this.options.extractTime(loResult)
                }, loResult);

            }
            laNewsItems.sort(this.options.sort);
            if (laNewsItems.length > this.options.maxResults)
            {
                laNewsItems = laNewsItems.splice(laNewsItems.length - this.options.maxResults);
            }
            for(i=0, lnLength = laNewsItems.length; i<lnLength; i++)
            {
                this._addItem(laNewsItems[i]);
            }
            this.options.update.call(this);
        },
        _addItem : function(toItem)
        {
            if (this._keyList.indexOf(toItem.key) < 0)
            {
                this._keyList.push(toItem.key);
                this._itemList.push(toItem);
            }
        },
        _removeItem : function(toItem)
        {
            var lcKey = toItem.key;
            var lnKeyIndex = this._keyList.indexOf(lcKey);
            var lnItemIndex = this._itemList.indexOf(toItem);
            if (lnKeyIndex >= 0)
            {
                this._keyList.splice(this._keyList.indexOf(lcKey), 1);
            }
            if (lnItemIndex >= 0)
            {
                this._itemList.splice(this._itemList.indexOf(toItem), 1);
            }
        },
        _update : function()
        {
            var llModified = false;
            while (this._itemList.length > this.options.maxResults)
            {
                var loItem = this._itemList.shift();
                this._removeItem(loItem);

                if (loItem['tag'] && loItem.remove)
                {
                    loItem.remove();
                    llModified = true;
                }
            }

            for(i=0, lnLength = this._itemList.length; i<lnLength; i++)
            {
                var loItem = this._itemList[i];
                if (!loItem['tag'])
                {
                    if (this.options.clearElement)
                    {
                        this._feedReel.html('');
                        this.options.clearElement = false;
                    }
                    var loElement = $jQ(this.options.createTemplate(loItem)).hide().prependTo(this._feedReel).slideDown().css({"display" : "inline-block"});
                    loItem['tag'] = loElement;
                    if (this.options.onFeedItemClicked)
                    {
                        $jQ(loItem['tag']).click(
                            {
                                "universe" : this,
                                "item" : loItem,
                            }, this.options.onFeedItemClicked);
                    }
                    llModified = true;
                }
                $jQ(".time", loItem['tag']).html(this.options.parseTime(loItem.time));
            }

            if (llModified)
            {
                this.options.onUpdateComplete.call(this);
            }
        },
        start : function(tnRate)
        {
            window.clearTimeout(this._refreshTimeout);
            this._refreshTimeout = window.setTimeout(dromos.utilities.createCallback(
                function()
                {
                    this._refresh(tnRate);
                }, this), tnRate);
        },
        destroy : function()
        {
            this._feedReel.html('');
            $jQ.Widget.prototype.destroy.apply(this, arguments);
        }
    });

    dromos.newsfeed = 
    {
        init : function(toElement, toConfig, tnIndex)
        {
            $jQ(toElement).newsfeed(toConfig);
        }
    }
    return dromos.newsfeed;
});

