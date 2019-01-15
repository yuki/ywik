function get_path(){
    return window.location.hash.substring(1);
}

function get_url(){
    return location.protocol+'//'+location.hostname+(location.port?":"+location.port:"");
}

function make_action(get_what,element_id){
    data_object = {
        "jsonrpc":"2.0",
        "id":1,
        "method":"VideoLibrary.Get"+get_what,
        "params":{
            "properties":[
                "title",
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
                $("#items-list").append(
                    $("<a>").attr("href","#"+get_what+"/"+id).attr("class","list-group-item list-group-item-action").html(element.label)
                );
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
        case "movies":
            make_action("movies",id);
            break;
        case "tvshows":
            make_action("tvshows",id);
            break;
    }
}
