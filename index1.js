
function getAbsoluteHeight(el) {
    var styles = window.getComputedStyle(el);
    var margin = parseFloat(styles['marginTop']) +
                 parseFloat(styles['marginBottom']);

    return Math.ceil(el.offsetHeight + margin);
}
function getAbsoluteWidth(el) {
    var styles = window.getComputedStyle(el);
    var marginAndPadding = parseFloat(styles['marginLeft']) +
                 parseFloat(styles['marginRight']) +
                 parseFloat(styles['paddingRight']) +
                 parseFloat(styles['paddingLeft']);

    return Math.ceil(el.offsetWidth + marginAndPadding);
}
function hasVerticalScrollbar(el,height) {
    return el.scrollHeight > height
}
function hide(el,func = null) {
    el.classList.remove('show_anim')
    el.classList.add('hide_anim')
    if(func) {
        setTimeout(func,300)
    }
}
function show(el,func = null) {
    el.classList.add('show_anim')
    el.classList.remove('hide_anim')
    if(func) {
        setTimeout(func,300)
    }
}

function copyToClipboard(text) {
    var tempInput = document.createElement("input");
    tempInput.style = "position: absolute; left: -1000px; top: -1000px";
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
}

document.addEventListener("DOMContentLoaded", function(event) {
    let sidebar_max_height = document.querySelector('#sidebar .sidebar-middle').clientHeight;
    let element_height = getAbsoluteHeight(document.querySelector('#sidebar .sidebar-middle').firstElementChild);
    let max_elements = (sidebar_max_height/element_height).toFixed(0)-3;
    let sidebarTimeout;
    if(hasVerticalScrollbar(document.querySelector('#sidebar .sidebar-middle'),sidebar_max_height)){
        let i = 0
        Array.from(document.querySelector('#sidebar .sidebar-middle').children).forEach(function(el1){
            if(el1.getAttribute('data-dropdown-target') !== "more") {
                if(i > max_elements){
                    let el = el1.cloneNode(true);
                    el.classList.remove('opacity-0')
                    document.querySelector('[data-dropdown-id="more"]').append(el)
                    el1.classList.add('d-none')
                } else {
                    el1.classList.remove('opacity-0')
                }
                i++;
            } else {
                el1.classList.remove('opacity-0')
            }
        })
    } else {
        document.querySelector('[data-dropdown-target="more"]').classList.add('d-none')
        Array.from(document.querySelector('#sidebar .sidebar-middle').children).forEach(function(el){
            el.classList.remove('opacity-0')
        })
    }
    let active_dropdown = null;
    document.querySelectorAll('[data-dropdown-target]').forEach(function(el){
        let db = document.querySelector('[data-dropdown-id="'+el.getAttribute('data-dropdown-target')+'"]')
        if(db.getAttribute('data-placement') == "top") {
            db.style.top = (el.offsetTop - getAbsoluteHeight(db) + getAbsoluteHeight(el) -6.2)+"px"
        } else {
            if(!el.parentElement.classList.contains('sidebar-dropdown-body')) {
                db.style.top = (el.offsetTop)+"px"
            } else {
                db.style.top = (document.querySelector("[data-dropdown-target='more']").offsetTop)+"px"
                db.style.minHeight = getAbsoluteHeight(document.querySelector("[data-dropdown-id='more']"))+"px"
            }
        }
        db.classList.add('hide_anim')
        el.addEventListener('click',function(e){
            if(document.querySelector('#sidebar').classList.contains('active')) {
                let button = e.currentTarget
                let dropdown_body = document.querySelector('[data-dropdown-id="'+button.getAttribute('data-dropdown-target')+'"]')
                button.classList.add('active')
                if(active_dropdown == dropdown_body.getAttribute('data-dropdown-id')){
                    button.classList.remove('active')
                    dropdown_body.setAttribute('data-dropdown-state',"no")
                    hide(dropdown_body)
                    active_dropdown = null;
                } else {
                    if(active_dropdown) {
                        document.querySelector('[data-dropdown-target="'+active_dropdown+'"]').classList.remove('active')
                        document.querySelector('[data-dropdown-id="'+active_dropdown+'"]').setAttribute('data-dropdown-state',"no")
                        hide(document.querySelector('[data-dropdown-id="'+active_dropdown+'"]'))
                        active_dropdown = null;
                    }
                    dropdown_body.setAttribute('data-dropdown-state',"yes")
                    show(dropdown_body)
                    active_dropdown = dropdown_body.getAttribute('data-dropdown-id')
                }
            }

        })
    })
    setTimeout(function(){
        document.querySelectorAll('[data-dropdown-target]').forEach(function(el){
            let db = document.querySelector('[data-dropdown-id="'+el.getAttribute('data-dropdown-target')+'"]')
            db.classList.remove('hide_noanim')
        })

    },300)
    document.querySelector('#sidebar').addEventListener('mouseenter',function(el){
        if(sidebarTimeout !== null) {
            clearTimeout(sidebarTimeout)
            sidebarTimeout = null
        }
        document.querySelector("#sidebar").classList.add('active')
    })
    document.querySelector('#content').addEventListener('mouseenter',function(el){
        if(sidebarTimeout == null) {
            sidebarTimeout = setTimeout(function(){
                if(active_dropdown) {
                    document.querySelector('[data-dropdown-id="'+active_dropdown+'"]').setAttribute('data-dropdown-state',"no")
                    document.querySelector('[data-dropdown-target="'+active_dropdown+'"]').classList.remove('active')
                    hide(document.querySelector('[data-dropdown-id="'+active_dropdown+'"]'),function(){
                        document.querySelector("#sidebar").classList.remove('active')
                    });
                    active_dropdown = null;
                } else {
                    document.querySelector("#sidebar").classList.remove('active')
                }
            },300)
        }
    })
    if(document.querySelector('select')) {
        dselect(document.querySelector('select'))
    }
    document.querySelector('[data-toggle="open-sidebar"]').addEventListener('click',function(){
        document.querySelector('#sidebar-mobile').classList.add('active')
    })
    document.querySelector('[data-toggle="close-sidebar"]').addEventListener('click',function(){
        document.querySelector('#sidebar-mobile').classList.remove('active')
    })
    const readNotificationsBtn = document.getElementById('readNotifications');
    let readingNotifications = false;

    if (readNotificationsBtn) {
        readNotificationsBtn.addEventListener('click', function (e) {
            e.preventDefault();

            if (readingNotifications) {
                return;
            }

            readingNotifications = true;

            const notificationsSpinner = readNotificationsBtn.querySelector('.load-spinner');

            if (notificationsSpinner) {
                notificationsSpinner.classList.remove('d-none');
            }

            notificationsSpinner.classList.remove('d-none');

            axios.post(readNotificationsBtn.href)
                .then(function () {
                    notificationsSpinner.classList.add('d-none');
                    readNotificationsBtn.classList.add('disabled');
                    document.querySelector('#notifications').innerHTML = ""
                    document.querySelectorAll('#notificationsCount').forEach(function(el){
                        el.innerHTML = '0'
                    })
                    document.querySelectorAll('[data-bs-target="#notificationsModal"] .badge').forEach(function(el){
                        el.innerHTML = '0'
                    })
                    console.log('test')
                })
                .catch(function () {
                    notificationsSpinner.classList.add('d-none');

                    readingNotifications = false;
                });
        });
    }
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

    let likeLoading = false;

    document.querySelectorAll('[data-like-url]').forEach(function (el) {
        el.addEventListener('click', function (e) {
            e.preventDefault();

            if (likeLoading) {
                return;
            }

            likeLoading = true;

            const likeSpinner = el.querySelector('.load-spinner');

            if (likeSpinner) {
                likeSpinner.classList.remove('d-none');
            }

            axios.request({
                url: el.dataset['likeUrl'],
                method: el.classList.contains('active') ? 'delete' : 'post'
            }).then(function (json) {

                if (json.data.liked === true) {
                    el.classList.add('active');
                    el.querySelector('i').classList.remove("bi-heart")
                    el.querySelector('i').classList.add("bi-heart-fill")
                } else {
                    el.classList.remove('active');
                    el.querySelector('i').classList.add("bi-heart")
                    el.querySelector('i').classList.remove("bi-heart-fill")
                }

                const likesCount = el.querySelector('.likes-count');

                if (likesCount) {
                    likesCount.innerHTML = json.data.likes;
                }
            }).finally(function () {
                likeSpinner.classList.add('d-none');
                likeLoading = false;
            });
        });
    });

    document.querySelectorAll('[data-confirm="delete"]').forEach(function (el) {
        el.addEventListener('click', function (ev) {
            ev.preventDefault();

            const url = el.getAttribute('href');

            document.getElementById('confirmDeleteForm').setAttribute('action', url);
            new bootstrap.Modal(document.getElementById('confirmDeleteModal')).show();
        })
    });


})