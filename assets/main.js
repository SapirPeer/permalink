(function($) {
    var client = ZAFClient.init();
    //iridize API 
    var urlAddress = "https://d2p93rcsj9dwm5.cloudfront.net/player/latest/api/scenario/list/";
    var iridizeData;
    var selectors = {
        resultsContainer: ".ir__guide-search__results",
        inputContainer: ".ir__guide-search__input",
        noResults: ".ir__guide-search__no-results"
    };


    function displayGuide(permalink, displayName, description) {
        // append relevant guide to results container
        $(`<li class="ir__guide-search__results__item"><div class = "ir__guide"><i class="ir__guide__icon"></i><div class="ir__guide__info"><a  href=${permalink} > ${displayName}</a>
    <div class="ir__guide__description">${description}</div></div</div></li>`).click(function() {
            insertGuideLinkToEditor(permalink)
        }).appendTo((selectors.resultsContainer));

    };

    function guidesSearch(userInput) {
        //Searches for guides whose description or name matches the user input.
        var searchResult = [];
        var guide;
        //regular experssion that ignore cases.
        var inputRegExp = new RegExp(userInput, "i");
        //clean results from previous searches.
        $(selectors.resultsContainer).empty();
        //Check whether the description or name of each guide in api matches the user input.
        $.each(iridizeData.guides, function(index) {
            guide = iridizeData.guides[index];
            if (guide.displayName.match(inputRegExp) || guide.description.match(inputRegExp)) {
                searchResult.push(guide);
            }
        });
        return searchResult;
    };

    function displayGuides(searchResult) {
        var userInput = $(selectors.inputContainer).val();
        var permalink;
        var guide;
        //No matching guides found
        if (searchResult.length == 0) {
            $(selectors.noResults).show();
            //Matching guides found. 
        } else if (searchResult.length > 0) {
            $(selectors.noResults).hide();
            for (i = 0; i < searchResult.length; i++) {
                guide = searchResult[i];
                permalink = guide.startUrl + "?stStart=" + guide.apiName;
                displayGuide(permalink, guide.displayName, guide.description);
            }
        }
        //Case the input field is empty - clear all previous results
        if (userInput === "") {
            $(selectors.resultsContainer).empty();
        }
    };

    function insertGuideLinkToEditor(permalink) {
        //Sends the permalink of the guide on which the user clicked to  ticket editor.
        var guidePermalink = `<a href=${permalink}>Launch a guide</a>`;
        client.invoke('ticket.editor.insert', guidePermalink);

    };


    function init() {
        var userInput;
        var searchResult;
        // request to get iridize api
        //https://d2p93rcsj9dwm5.cloudfront.net/player/edge/api/scenario/list/iridize.com/sapir@iridize.com/?callback=__listGuides&env=prod
        $.ajax({
            url: urlAddress + window.appId+'/',
            jsonpCallback: "__listGuides",
            dataType:"jsonp",
            cache:true,            
            data: {
                env:'prod'
            },
            success: function(response) {
                //remove load animtaion
                $("div").removeClass("ir__guide__load-animation");
                $(".ir__guide-search__input").show();
                iridizeData = response.data;
                //Start the search and display process when the user starts typing.
                $('#search-field').keyup(function() {
                    userInput = $(selectors.inputContainer).val();
                    searchResult = guidesSearch(userInput);
                    displayGuides(searchResult);


                });
            }
        });
    }
    client.metadata().then(
        function(metadata) {
            window.appId = client._metadata.settings.appId;
            init();

        },
        function(metadata) {});

    //Set the maximum app window size in zendesk page. 
    client.invoke('resize', {
        width: '300px',
        height: '750px'
    });

})($);