/*====================================
anchor tag that takes an ajax action when clicked.

====================================*/
define(["jquery"], function($jQ)
{
    $jQ.widget('dromos.ajaxLink',
    {
        options : {
            containerTemplate : function(){return $jQ("<div class=\"ajaxLinkContainer\"></div>");},
            /**
             * This occurs when the link is clicked.  This event will occur regardless of which event will trigger the
             * ajax load.  If the ajax load is bound to the click event then this handler will USUALLY be called after the ajax
             * load handler, but not always.
             * @param  Event toEvent the event that occurred
             */
            onClick : function(toEvent){/* By default this takes no action */},
            /**
             * This occurs when the user moves the mouse over the link.
             * @param  Event toEvent the event that occurred
             */
            onStartHover : function(toEvent){/* By default this takes no action */},
            /**
             * This occurs when the user moves the mouse off the link.
             * @param  Event toEvent the event that occurred
             */
            onStopHover : function(toEvent){/* By default this takes no action */},
            /**
             * Occurs when the ajax call has been made but has timed out
             */
            onTimeout : function(){alert('oops you timed out');},
            // The link to make the ajax request to, if false the ajax request will be made to the anchor href (default)
            link : false,
            // The target, the result of the ajax call will be loaded into the target, if the target is false then a popup will be created to host the content (default)
            target : false,
            // The method to use to  make the ajax call, "GET" is the default
            method : 'GET',
            // The event to bind to for loading the ajax content, click is default
            loadEvent: 'click',
            // Used for jsonp callbacks
            callbackMarker : "callback=?",
            // Expected return type
            dataType : "html",
            // The max wait before timing out the ajax request
            timeout : 5000,
            // Flag to state if the call can be cached by the browser, caching by default
            cache : true,
            // The default content type that will be sent to the server for POST requests
            contentType : "application/x-www-form-urlencoded; charset=UTF-8",
            contentTemplate : "<div class=\"ajaxLinkWindow\"><div class=\"content\"></div></div>"

            // TODO :Load image
            // TODO: load title
            // TODO: method
            // TODO: Post form data
            // TODO: Ajaxify links in response
            // TODO: onSuccess return
            // TODO: onError
            // TODO: onRequestStarted
            // TODO: onRequestTimedOut
            // TODO: once content loading/loaded, don't attempt to reload
            // 
            // preload link
            // todo: use target as where to load the ajax result
        },
        _create : function()
        {
            this.element.css({"background" : "red"});
            // Bind to the loadEvent click and hover events
            $jQ(this.element).bind(this.options.loadEvent, dromos.utilities.createCallback(
                function(toEvent)
                {
                    toEvent.preventDefault();
                    this._loadContent();
                }, this)).click(dromos.utilities.createCallback(function(toEvent)
                {
                    toEvent.preventDefault();
                    this.options.onClick.call(this, toEvent);
                }, this)).hover(dromos.utilities.createCallback(function(toEvent)
                {
                    this.options.onStartHover.call(this, toEvent);
                }, this), dromos.utilities.createCallback(function(toEvent)
                {
                    this.options.onStopHover.call(this, toEvent);
                }, this));
        },
        /**
         * Loads the content through an ajax call
         * @param  {[type]} tcURL    [description]
         * @param  {[type]} tcMethod [description]
         * @param  {[type]} tcTarget [description]
         * @return {[type]}          [description]
         */
        _loadContent : function()
        {
            if (!this._isLoading)
            {
                this._isLoading = true;

                $jQ.ajax({
                    type: this.options.method,
                    url: this.getUrl(), // implement the following for jsonp + (tcURL.indexOf('?') >= 0 ? '&' : '?' ) + this.options.callbackMarker,
                    dataType: this.options.dataType,
                    global: false,
                    crossDomain: true,
                    timeout: this.options.timeout,
                    cache : this.options.cache,
                    contentType : this.options.contentType,
                    context: this,
                    complete : dromos.utilities.createCallback(
                            function(toXHR, tcStatus)
                            {
                                this.onComplete();
                                this._isLoading = false;
                            }, this),
                    error : dromos.utilities.createCallback(
                            function(toXHR, tcStatus, toError)
                            {
                                console.error(toError);
                                this.onError(tcStatus);
                            }, this),
                    success : dromos.utilities.createCallback(
                            function(toData, tcStatus, toXHR)
                            {
                                this.onSuccess(toData);
                            }, this)
                });
            }
        },
        // Flag to indicate if a request is underway
        _isLoading : false,
        // Gets the URL that is to be requested by the ajax request
        getUrl : function(){return this.options.url || $jQ(this.element).attr('href');},
        // Gets the target for the successful ajax request
        getTarget : function(){return this.options.target || $jQ(this.element).attr('target') || "_blank";},
        // Occurs only when the ajax request has been successful
        onSuccess : function(toData)
        {
            var lcTarget = this.getTarget();
            if (lcTarget === "_blank")
            {
                // Create the window
                if (!this._target)
                {
                    this._target = $jQ(this.options.contentTemplate);
                    $jQ(this.element).after(this._target);
                    this._target = $jQ(".content", this._target);
                }
            }
            else
            {
                this._target = $jQ(this.getTarget());
            }
            $jQ(this._target).html(toData);
        },
        // Occurs only when an error occurs with the ajax request
        onError : function(tcError){console.error('ERROR'); console.error(tcError);},
        // Occurs after the ajax request has completed, either by error or by success
        onComplete : function(){console.error('COMPLETE');},
        // Occurs after the ajax request has timed out
        onTimeout : function(){console.error('TIMEOUT');}
    });

    dromos.ajaxLink =
    {
        init : function(toElement, toConfig, tnIndex)
        {
            $jQ(toElement).ajaxLink(toConfig);
        }
    };
    return dromos.ajaxLink;
});

