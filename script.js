var lista;
var log_poruke = document.getElementById("poruke");
var UL = document.getElementById("myUL");
var myHeader = document.getElementById("myHeader");
var username;
var pass;

var dodajTextu = "--normalan--"; 

// ---- provera da li je user ulogovan ----- 
if (sessionStorage.hasOwnProperty("token")) {
    log_poruke.innerHTML = "Ulogovani ste kao: " + username;
    document.getElementById("logout_btn").style.display = "block";
    document.getElementById("login_form").style.display = "none";
    get();
    UL.style.display = "block";
    myHeader.style.display = "block";
    logout();
} else {
    document.getElementById("logout_btn").style.display = "none";
    document.getElementById("login_form").style.display = "block";
    UL.style.display = "none";
    myHeader.style.display = "none";
    login();
}

// ------------ Funkcije za logovanje ---------------
function login() {
    $('#login_btn').click(function () {
        var username = document.getElementById("username").value;
        var pass = document.getElementById("password").value;
        $.ajax({
            method: 'POST',
            url: "http://todo.digitalcube.rs/user/login?username=" + username + "&password=" + pass
        }).done(function (data) {
            var response = JSON.parse(data);
            console.log(response);
            sessionStorage.setItem("token", response.token);
            location.reload();
        })
    })
}

function logout() {
    $('#logout_btn').click(function () {
        $.ajax({
            method: 'POST',
            url: "http://todo.digitalcube.rs/user/logout",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", sessionStorage.token);
            },
        }).done(function (data) {
            sessionStorage.removeItem("token");
            location.reload();
        })
    });
}

// -------Pozivanje sa bazom ------
function get() {
    $.ajax({
        method: 'GET',
        url: "http://todo.digitalcube.rs/api/todos",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", sessionStorage.token);
        },
    }).done(function (data) {
        var response = JSON.parse(data);
        lista = response.todos;
        console.log(response.todos);
        generateHtml(response.todos);
    });
}

function generateHtml(responseToDo) {
    var hitno = "";
    var prelaz1 = '<div class="prelaz1"></div>';
    var normalno = "";
    var prelaz2 = '<div class="prelaz2"></div>';
    var canWait = "";
    var prelaz3 = '<div class="prelaz3"></div>';
    var uradjeniZadaci = "";

    var i;
    for (i = 0; i < responseToDo.length; i++) {
        
        var text = responseToDo[i].content;
        var prioritet = text.slice(0, 11);
        
        if (responseToDo[i].done === true) {
            uradjeniZadaci += "<li class='checked' onClick='dropDown(" + responseToDo[i].id + ")'><div style='width: 90%;'>" + responseToDo[i].content.substring(12) + "</div><span class='close' onClick='deleteItem(" + responseToDo[i].id + ")'>delete</span></li>";
        } else if (prioritet.indexOf("normalan") >= 0) {
                normalno += "<li class='normal' onClick='dropDown(" + responseToDo[i].id + ")'><div style='width: 100%;'>" + text.substring(12) + "</div></li>";
        } else if (prioritet.indexOf("hitno") >= 0) {
                hitno += "<li class='hitno' onClick='dropDown(" + responseToDo[i].id + ")'><div style='width: 100%;'>" + text.substring(12) + "</div></li>";
        } else if (prioritet.indexOf("canwait") >= 0) {
                canWait += "<li class='canWait' onClick='dropDown(" + responseToDo[i].id + ")'><div style='width: 100%;'>" + text.substring(12) + "</div></li>";
        }
    }
    var htmlString = hitno + prelaz1 + normalno + prelaz2 + canWait + prelaz3 + uradjeniZadaci;
    //todoContainer.insertAdjacentHTML('beforeend', htmlString);
    UL.insertAdjacentHTML('beforeend', htmlString);
}

function dropDown(id){
    var x = event.clientX;
    var y = event.clientY;
    var h = window.innerHeight;
    var l = window.innerWidth;
    var dropElement = document.getElementById("dropDown");
    var maska = document.getElementById("maska");
    
    var elmnt = document.getElementById("container");
    var scrollHeight = elmnt.scrollHeight;
    
    if (x > (l/2)){
        dropElement.style.left = x - 150 + "px";
    } else {
        dropElement.style.left = x + "px";
    }
    if (y > (h-235)) {
        dropElement.style.top = y - 235 + window.pageYOffset + "px";
    } else {
        dropElement.style.top = y + window.pageYOffset + "px";
    }
    
    
    maska.style.height = scrollHeight + "px";
    maska.style.display = "block";
    
    $("#dropDown").slideToggle("medium");
    document.addEventListener("click", function _listener(event) {
        maska.style.display = "none";
        if (!event.target.closest("#dropDown")) {
            $("#dropDown").slideToggle("medium");
            event.stopPropagation();
            document.removeEventListener("click", _listener, true);
        } else {
            var i;
            for (i = 0; i < lista.length; i++) {
                if (lista[i].id === id){
                    var text = lista[i].content;
                    var ostatakTexta = text.substring(12);
                    var prioritet = text.slice(0, 11);
                    if (event.target.closest(".hitno")){
                        prioritet = "--hitno-----";
                        var upload = prioritet + ostatakTexta;
                        put(upload);
                        deleteItem(id);                        
                    } else if (event.target.closest(".normal")){
                        prioritet = "--normalan--";
                        upload = prioritet + ostatakTexta;
                        put(upload);
                        deleteItem(id);                        
                    } else if (event.target.closest(".canWait")){
                        prioritet = "--canwait---";
                        upload = prioritet + ostatakTexta;
                        put(upload);
                        deleteItem(id);                        
                    } else if (event.target.closest(".uradjeno")){
                        patch(id);
                    } else if (event.target.closest(".izbrisi")){
                        deleteItem(id);
                    }
                }
                
            }
            $("#dropDown").slideToggle("medium");
            event.stopPropagation();
            document.removeEventListener("click", _listener, true);
        }      
    }, true);
    // patch(id);
}

function put(data) {
    $.ajax({
        method: 'PUT',
        url: "http://todo.digitalcube.rs/api/todos",
        data: {
            content: data
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", sessionStorage.token);
        }
    })
}

function deleteItem(id) {
    $.ajax({
        method: 'DELETE',
        url: "http://todo.digitalcube.rs/api/todos/" + id,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", sessionStorage.token);
        }
    }).done(function () {
        location.reload();
        get();
    })
}

function patch(id) {
    var i;
    for (i = 0; i < lista.length; i++) {
        if (lista[i].id === id) {
            if (lista[i].done == true) {
                $.ajax({
                    method: 'PATCH',
                    url: "http://todo.digitalcube.rs/api/todos/" + id,
                    data: {
                        done: false
                    },
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("Authorization", sessionStorage.token);
                    }
                }).done(function () {
                    location.reload();
                    get();
                })
            } else {
                $.ajax({
                    method: 'PATCH',
                    url: "http://todo.digitalcube.rs/api/todos/" + id,
                    data: {
                        done: true
                    },
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("Authorization", sessionStorage.token);
                    }
                }).done(function () {
                    location.reload();
                    get();
                })
            }
        }
    }
}

// Create a new list item when clicking on the "Add" + " button

function add() {
    var inputValue = document.getElementById("myInput").value;
    var sendContent = dodajTextu + inputValue;
    if (!sessionStorage.hasOwnProperty("token")) {
        alert("Morate biti ulogovani da bi koristili aplikaciju!");
    } else if (inputValue === '') {
        alert("Nemoguće je da nemaš šta da radiš! Rad je stvorio coveka.");
        return;
    } else {
        put(sendContent);
    }
    location.reload();
    get();
}

$('#priorityBtn').click(function () {
    $("#priority_dropDown").slideToggle("medium");
    document.addEventListener("click", function _listener(event) {
        if (!event.target.closest("#priorityBtn")) {
            $("#priority_dropDown").slideToggle("medium");
            event.stopPropagation();
            document.removeEventListener("click", _listener, true);
        } else {
            if (event.target.closest(".hitno")){
                dodajTextu = "--hitno-----";
                add();
            } else if (event.target.closest(".canWait")){
                dodajTextu = "--canwait---";
                add();
            } else if (event.target.closest(".normal")){
                dodajTextu = "--normalan--";
                add();
            }
            $("#priority_dropDown").slideToggle("medium");
            event.stopPropagation();
            document.removeEventListener("click", _listener, true);
        }      
    }, true);
})
