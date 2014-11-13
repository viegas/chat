var self;

function insertMessage(message, sender) {
    if (sender == "self") {
        $("#log-message ul").append("<li class='self-msg'>" + message + "</li>");
    }
    else {
        $("#log-message ul").append("<li>" + message + "</li>");
    }
}

var socket = io.connect();

socket.on("messages", function(data, sender) {
    insertMessage(data, sender);
    $('#log-message').scrollTop($('#log-message').prop("scrollHeight"));
});


socket.on("manage chatter", function(user, operation) {
    
    var members = $("#members ul");
    var log = $("#log-message ul");
    var serverMessage = {
        enter: "<li class='server-msg'>" + user + " entrou na sala</li>",
        leave: "<li class='server-msg'>" + user + " saiu da sala</li>"
    }
    
    switch (operation) {
        case "add": {
             var new_user = "<li>" + user + "</li>";
             members.append(new_user);
             log.append(serverMessage.enter);
        } break;
        
        case "remove": {
             $("#members ul li:contains(" + user + ")").remove();
             log.append(serverMessage.leave);
        } break;
        
        case "mount": {
            //clear chat
            $("#members ul").empty();
            $("#log-message ul").empty();
            
            $("#members ul").append("<li class='self'>" + self + "</li>");
            
            for (x in user) {
                var online_user = "<li>" + user[x] + "</li>";
                $("#members ul").append(online_user);
            }
        } break;
        
        case "kick": {
            var self_name = $(".self").text();
            if (self_name === user) {
                $("#close").click();
                alert("Você foi expulso!");
            }
        } break;
        
    }
});


$(document).ready(function() {

    $("#start button").click(function() {
        var nickname = $("#nickname").val();

        if (nickname !== "") {
            $(".darkscreen").fadeOut("fast");
            $("#chat").css("border-bottom", "8px solid #d3d3d3");
            socket.emit("join", nickname);
            self = nickname;
        }
        else {
            $("#nickname").addClass("inp-error");
            $("#nickname").attr("placeholder", "Preencha seu nome!");
        }
    });

    $("#nickname").blur(function() {
        if ($(this).val() !== "") {
            $(this).removeClass("inp-error");
            $(this).attr("placeholder", "Nome");
        }
    });

    $("#nickname").keypress(function(e) {
        if (e.which == 13) {
            $("#start button").click();
        }
    });

    $("#close").click(function() {
        $(".darkscreen").fadeIn("fast");
        $("#members ul").empty();
        $("#log-message ul").empty();
        $("#nickname").val("");
        $("#chat").css("border-bottom", "0px solid #d3d3d3");
        socket.emit("leave", self);
    });

    $("#box-message").submit(function(e) {
        var message = $("#message").val();
        var nickname = $("#nickname").val();
        e.preventDefault();
        $("#message").val("");
        $("#send").addClass("btn-pressed").delay(100).queue(function(next) {
            $(this).removeClass("btn-pressed");
            next();
        });
        
        if (message.substr(0,5) == "/kick") {
            var user = message.substr(6);
            if( $("#members ul li:contains('"+ user +"')").length > 0 ) {
               socket.emit("kick", user); 
               $("#log-message ul").append("<li class='server-msg'>"+ user +" foi expulso da sala. (;</li>");
            }
            else {
                $("#log-message ul").append("<li class='server-msg'>Usuário não existe. ):</li>");
            }
        }
        else {
            socket.emit("messages", message);
        }
    });

});