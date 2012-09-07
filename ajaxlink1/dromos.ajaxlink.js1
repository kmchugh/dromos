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
            onStartHover : function(toEvent)
            {
                if (this._targetContainer)
                {
                    this._targetContainer.css({"display" : "block"});
                }
            },
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
            url : false,
            // The target, the result of the ajax call will be loaded into the target, if the target is false then a popup will be created to host the content (default)
            target : false,
            // The method to use to  make the ajax call, "GET" is the default
            method : 'GET',
            // The event to bind to for loading the ajax content, click is default
            loadEvent: 'mouseover',
            // Used for jsonp callbacks
            callbackMarker : "callback",
            // Flag to state if the user can click on the link to go through to the original url anyway
            preventClickThrough : false,
            // Expected return type
            dataType : "html",
            // The max wait before timing out the ajax request
            timeout : 5000,
            // Flag to state if the call can be cached by the browser, caching by default
            cache : true,
            // The default content type that will be sent to the server for POST requests
            contentType : "application/x-www-form-urlencoded; charset=UTF-8",
            // Flag to state if content should be reloaded once it has been loaded once
            allowReload : false,
            // The class that will be used to decorate the container
            containerClass : "ajaxLinkWindow",
            // The template to use when pushing content to _blank.  The content will be placed in the element with the content class
            contentTemplate : "<div><div class=\"content\"></div></div>",
            // The data to send as part of the request
            data : null,

            // TODO :Load image
            // TODO: load title
            // TODO: method
            // TODO: Post form data
            // TODO: Ajaxify links in response
            // TODO: onSuccess return
            // TODO: onError
            // TODO: Implement cross domain
            // TODO: onRequestStarted
            // TODO: onRequestTimedOut
            // TODO: once content loading/loaded, don't attempt to reload
            //
            // preload link
            // todo: use target as where to load the ajax result
        },
        _create : function()
        {
            var loJQElement = $jQ(this.element);
            this.options.url = this.options.url || loJQElement.attr('href');
            loJQElement.attr("href", "#");

            // Bind to the loadEvent click and hover events
            loJQElement.bind(this.options.loadEvent, dromos.utilities.createCallback(
                function(toEvent)
                {
                    this._loadContent();
                }, this)).click(dromos.utilities.createCallback(function(toEvent)
                {
                    if (toEvent.target == this.element[0])
                    {
                        if (!this.options.preventClickThrough)
                        {
                            window.location = this.options.url;
                        }
                    }
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
            if (!this._isLoading && (this._content == null || this.options.allowReload))
            {
                this._isLoading = true;

                $jQ.ajax({
                    type: this.options.method,
                    url: this.options.url,
                    dataType: this.options.dataType,
                    jsonp:this.options.callbackMarker,
                    global: false,
                    timeout: this.options.timeout,
                    cache : this.options.cache,
                    contentType : this.options.contentType,
                    context: this,
                    data : this.options.data,
                    complete : dromos.utilities.createCallback(
                            function(toXHR, tcStatus)
                            {
                                this.onComplete();
                                this._isLoading = false;
                            }, this),
                    error : dromos.utilities.createCallback(
                            function(toXHR, tcStatus, toError)
                            {
                                console.error(toXHR);
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
        _target : false,
        _targetContainer : false,
        _containerFocus : false,
        
        // Gets the target for the successful ajax request
        getTarget : function(){return this.options.target || $jQ(this.element).attr('target') || "_blank";},
        // Occurs only when the ajax request has been successful
        onSuccess : function(toData)
        {
            this._content = toData;
            var lcTarget = this.getTarget();
            if (lcTarget === "_blank")
            {
                // Create the window
                if (!this._target)
                {
                    this._targetContainer = $jQ(this.options.contentTemplate).addClass(this.options.containerClass);
                    this._targetContainer.addClass(this.options.url.split('/')[1]);
                    $jQ(this.element).append(this._targetContainer);
                    this._target = $jQ(".content", this._targetContainer);

                    this._targetContainer.hover(dromos.utilities.createCallback(function(toEvent){
                        this._containerFous = true;

                    }, this), dromos.utilities.createCallback(function(toEvent){
                        if (this._containerFous)
                        {
                            this._targetContainer.css({"display" : "none"});
                            this._containerFous = false;
                        }
                    }, this));

                    this._targetContainer.click(dromos.utilities.createCallback(function(toEvent){
                        toEvent.stopImmediatePropagation();
                        toEvent.bubble = false;
                    }, this));
                }
            }
            else
            {
                this._target = $jQ(this.getTarget());
            }
            $jQ(this._target).html(this._content);
        },
        // Occurs only when an error occurs with the ajax request
        onError : function(tcError){console.error('ERROR'); console.error(tcError);},
        // Occurs after the ajax request has completed, either by error or by success
        onComplete : function(){},
        // Occurs after the ajax request has timed out
        onTimeout : function(){}
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

