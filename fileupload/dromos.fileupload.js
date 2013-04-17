/*====================================
 Stylable File Upload.

 ====================================*/
define(["jquery", "jqueryui"], function($jQ)
{
    $jQ.widget('dromos.fileUpload',
        {
            options : {
                wrapTemplate : '<div class="fileInput"></div>',
                fakeTemplate : '<div class="fakeFile"><input /><div class="selectButton">Select</div></div>'
            },
            _create : function()
            {
                $jQ(this.element)
                        .wrap(this.options.wrapTemplate)
                        .after(this.options.fakeTemplate).css({
                                'position' : 'relative',
                                '-moz-opacity' : 0,
                                '-ms-filter' : 'progid:DXImageTransform.Microsoft.Alpha(Opacity=0)',
                                'filter' : 'alpha(opacity=0)',
                                '-khtml-opacity' : 0,
                                'opacity' : 0,
                                'z-index' : 2
                            }).parent().css('position', 'relative')
                        .change(function(toEvent)
                            {
                                $jQ('.fakeFile > input', $jQ(this)).val($jQ('> input', $jQ(this)).val().replace(/C:\\fakepath\\/gi, ""));
                            });
                $jQ('.fakeFile', $jQ(this.element).parent()).css(
                    {
                        'position' : 'absolute',
                        'top' : '0px',
                        'left' : '0px',
                        'z-index' : 1
                    });




            }
        });

    dromos.fileUpload =
    {
        init : function(toElement, toConfig, tnIndex)
        {
            $jQ(toElement).fileUpload(toConfig);
        }
    };
    return dromos.fileUpload;
});

