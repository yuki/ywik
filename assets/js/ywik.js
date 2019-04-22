function get_path(){
    return window.location.hash.substring(1);
}

function get_url(){
    return location.protocol+'//'+location.hostname+(location.port?":"+location.port:"");
}

function copy_link(element){
    var link = document.getElementById("movie_link");
    link.select()
    document.execCommand("copy");
}

function get_episodes(tvshowid){
    data_object = {
        "jsonrpc":"2.0",
        "id":1,
        "method":"VideoLibrary.GetEpisodes",
        "params":{
            "tvshowid": tvshowid,
            "properties":[
                "season",
                "episode",
                "file"
            ],
            "sort":{
                "method":"season",
                "order":"ascending"
            }
        }
    };

    data_object = JSON.stringify(data_object);

    $.ajax({
        url: '/jsonrpc',
        type: 'POST',
        async: true,
        headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
        },
        data: data_object,
        dataType: 'json'
    }).done(function(response, textStatus, jqXHR){
        $("#seasons").empty();

        items_list = response.result.episodes;

        var season = -1;
        items_list.forEach(function(element) {
            var id = 0;
            if (season != element.season){
                $("#seasons").append(
                    $("<div>").attr("id","Season_"+element.season).attr("class","list-group-item list-group-item-action season_name bg-dark").html("Season "+element.season)
                );
                $("#Season_"+element.season).click(function (){
                    $(".Season_"+element.season).toggle();
                });
            }
            season = element.season;
            var clone = $("#episode_div").clone(true,true);
            clone[0].childNodes[1].childNodes[1].childNodes[1].href = get_url()+"/vfs/"+encodeURIComponent(element.file);
            clone[0].childNodes[1].childNodes[1].childNodes[3].href = "vlc-x-callback://x-callback-url/stream?url="+get_url()+"/vfs/"+encodeURIComponent(element.file);
            clone[0].childNodes[1].childNodes[3].childNodes[1].textContent = element.label;
            clone.attr("id",element.episodeid);
            clone.addClass("Season_"+element.season);
            $("#seasons").append(clone);
            //clone.show();
        });
    });
}

function make_action(get_what,element_id){
    data_object = {
        "jsonrpc":"2.0",
        "id":1,
        "method":"VideoLibrary.Get"+get_what,
        "params":{
            "properties":[
                "title",
                "plot",
                "thumbnail",
                "year",
                "rating",
                "file"
            ]
        }
    };

    if (element_id != 0){
        if (get_what == "movies"){
            data_object.method = "VideoLibrary.GetMovieDetails";
            data_object.params.movieid = parseInt(element_id);
        } else {
            data_object.method = "VideoLibrary.GetTVShowDetails";
            data_object.params.tvshowid = parseInt(element_id);
        }
    } else {
        data_object.params.sort = {};
        data_object.params.sort.order = "ascending";
        data_object.params.sort.method = "label";
        data_object.params.sort.ignorearticle = true;
    }

    data_object = JSON.stringify(data_object);

    $.ajax({
        url: '/jsonrpc',
        type: 'POST',
        async: true,
        headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
        },
        data: data_object,
        dataType: 'json'
    }).done(function(response, textStatus, jqXHR){
        $("#items-list").empty();

        if (element_id != 0){
            // GET ELEMENT INFO

            var element = "";
            if (get_what == "movies"){
                element = response.result.moviedetails;
            } else if (get_what == "tvshows"){
                element = response.result.tvshowdetails;
            }

            $("#show-item").show();
            $("#thumbnail").html(
                $("<img>").attr("src",get_url()+"/image/"+encodeURIComponent(element.thumbnail))
            );
            $("#title").html(element.label);
            $("#plot").html(element.plot);
            $("#movie_rating").html(element.rating.toFixed(1));
            $("#movie_link").attr("href",get_url()+"/vfs/"+encodeURIComponent(element.file));
            $("#play_movie").attr("href","vlc-x-callback://x-callback-url/stream?url="+get_url()+"/vfs/"+element.file);
            if (get_what == "tvshows"){
                get_episodes(element.tvshowid);
            }

        } else {
            // GET ALL ELEMENTS

            var items_list = "";
            if (get_what == "movies"){
                items_list = response.result.movies;
            } else if (get_what == "tvshows"){
                items_list = response.result.tvshows;
            }

            $("#show-item").hide();
            items_list.forEach(function(element) {
                var id = 0;
                if (get_what == "movies"){
                    id = element.movieid
                } else {
                    id = element.tvshowid
                }
                var clone = $("#item_list").clone(true,true);
                clone[0].href = "#"+get_what+"/"+id;
                clone[0].childNodes[0].textContent = element.label;
                clone[0].childNodes[1].childNodes[4].textContent = element.rating.toFixed(1);
                clone.show();
                $("#items-list").append(clone);
            });
        }
    });
}


function hash_changed(event){
    var path = get_path();
    var id = 0;

    if (path.search("/") > 0){
        // get movie/tvshow
        var params = path.split("/");
        path = params[0];
        id = params[1];
    }

    switch(path){
        case "":
            $("#remote").hide();
            $("#seasons").hide();
            $("#items-list").show();
            $("#extra_info").show();
            make_action("movies",id);
            break;
        case "movies":
            $("#remote").hide();
            $("#seasons").hide();
            $("#items-list").show();
            $("#extra_info").show();
            make_action("movies",id);
            break;
        case "tvshows":
            $("#remote").hide();
            $("#extra_info").hide();
            $("#items-list").show();
            $("#seasons").show();
            make_action("tvshows",id);
            break;
        case "remote":
            $("#show-item").hide();
            $("#items-list").hide();
            $("#remote").show();
            break;
    }
}
