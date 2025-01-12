/**
 * Component: Sync and select lockers
 * ------------------------------------------------------------------------------
 *
 * @namespace selectLocker
 */

const apiUsername = document.currentScript.dataset.apiusername; // LM API username
const langCode = document.currentScript.dataset.lang.toLowerCase(); //language of the plugin
const theme = document.currentScript.dataset.theme; //theme of the plugin: light, dark
const _token = Shopify.Checkout.token;
const _shop = Shopify.shop;

const getCountryCode = () => {
    if (typeof Shopify.checkout === 'undefined') {
        return Shopify.country;
    }

    return Shopify.checkout.shipping_address.country_code;
}

const getCity = () => {
    if (typeof Shopify.checkout === 'undefined') {
        return null;
    }

    return Shopify.checkout.shipping_address.city;
}

// Get LM API USER
const getApiUsername = () => {
    let checkoutDetails = Shopify.checkout;

    if ('' !== apiUsername) {
        return apiUsername;
    }

    let rate = null;
    if (typeof checkoutDetails.shipping_rate.handle !== "undefined") {
        rate = checkoutDetails.shipping_rate.handle;
    }

    if (null !== rate) {
        rate = rate.split('@')[1];
        if (typeof rate !== "undefined") {
            return rate;
        }
    }

    return 'shopify_custom_user';
}

// Default in English
let buttonSelect_text = "Select an easybox location";
let selectedLocker_text = "Please select an easybox location";
let selectedAnother_text = "Select another location";

if (langCode === 'ro') {
    buttonSelect_text = "Alegeti easybox-ul";
    selectedLocker_text = "Va rugam sa selectati locatia easybox-ului.";
    selectedAnother_text = "Selectati alta locatie";
}

if (langCode === 'hu') {
    buttonSelect_text = "VĂĄlassza az easybox lehetĹsĂŠget";
    selectedLocker_text = "VĂĄlassza az easybox lehetĹsĂŠget";
    selectedAnother_text = "VĂĄlasszon mĂĄsik easybox";
}

if (langCode === 'bg') {
    buttonSelect_text = "ĐĐˇĐąĐľŃĐľŃĐľ easybox";
    selectedLocker_text = "ĐĐžĐťŃ, Đ¸ĐˇĐąĐľŃĐľŃĐľ Đ´ŃŃĐł easybox";
    selectedAnother_text = "ĐĄĐźŃĐ˝Đ° Ń Đ´ŃŃĐł easybox";
}

const preloader = document.createElement("div");
preloader.classList.add( "loader" );
document.head.insertAdjacentHTML("beforeend", `<style>.loader { border: 16px solid #f3f3f3; border-radius: 50%; margin: auto; border-top: 16px solid #3498db; width: 50px; height: 50px; -webkit-animation: spin 2s linear infinite; animation: spin 2s linear infinite; } /* Safari */ @-webkit-keyframes spin { 0% { -webkit-transform: rotate(0deg); } 100% { -webkit-transform: rotate(360deg); } } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>`)

const buttonSelect = document.createElement("button");
buttonSelect.setAttribute("id","select_locker");
buttonSelect.classList.add( "btn" );
buttonSelect.style.cssText = 'width:100%;margin-top:10px;display:none';

const buttonSelectText = document.createTextNode(buttonSelect_text);
buttonSelect.appendChild(buttonSelectText);


const appendbuttonSelect = document.querySelector(".thank-you__additional-content");
appendbuttonSelect.insertBefore(buttonSelect, appendbuttonSelect.children[0]);
appendbuttonSelect.insertBefore(preloader, appendbuttonSelect.children[0]);

setTimeout(function() {
    document.querySelector('.step__footer').style.display = "none";
    document.title = buttonSelect_text;
}, 100);

setTimeout(function() {

    const selectedLocker = document.createElement("p");
    selectedLocker.setAttribute("id","selected_locker")
    selectedLocker.style.cssText = 'width:100%;margin-top:20px;text-align:center;font-weight:bold;font-size:22px;display:none';

    const selectedLockerText = document.createTextNode(selectedLocker_text);
    selectedLocker.appendChild(selectedLockerText);

    const appendselectedLocker = document.querySelector(".thank-you__additional-content");
    appendselectedLocker.insertBefore(selectedLocker, appendselectedLocker.children[0]);

}, 100);

document.getElementById("select_locker").onclick = function() {openLockerMap()};

function openLockerMap() {

    window['LockerPlugin'].init({
        clientId: 'b8cb2ee3-41b9-4c3d-aafe-1527b453d65e',
        countryCode: getCountryCode(),
        langCode: langCode,
        theme: theme,
        apiUsername: getApiUsername(),
        city: getCity(),
    });

    let pluginInstance = window['LockerPlugin'].getInstance();

    pluginInstance.open();

    pluginInstance.subscribe((message) => {
        let addressSelector = document.querySelector('.address');
        if (null !== addressSelector) {
            addressSelector.innerHTML = '<span style="display:none">'+message.lockerId +"</span>"+ message.name + '<br/>' +message.address;
        }

        document.getElementById("selected_locker").innerHTML = '<span style="display:none">'+message.lockerId +"</span>"+ message.name + '<br/>' +message.address;
        document.getElementById("selected_locker").style.cssText = 'width:100%;margin-top:20px;text-align:center;font-weight:bold;font-size:16px;';

        pluginInstance.close();

        fetch('https://samedayapp.sameday.ro/shopify/store_locker', {
            method: 'POST',
            body: JSON.stringify({shop: _shop, token: _token, locker: message })
        }).then(res => res.json()).then(data => console.log(data)).catch((error) => console.log(error));

        document.querySelector('.step__footer').style.display = "block";
        document.getElementById("select_locker").innerHTML = selectedAnother_text;

        const boxes = Array.from(document.getElementsByClassName('section'));
        boxes.forEach(box => {
            box.style.display = 'block';
        });
    })
}

fetch('https://samedayapp.sameday.ro/shopify/selected_locker', {
    method: 'POST',
    body: JSON.stringify({shop: _shop, token: _token })
}).then(res => res.json()).then(data => this.checkLockerExist(data)).catch((error) => {console.log(error)});

function checkLockerExist(data) {
    const showOrderDetails = (locker = null) => {
        if (null !== locker) {
            let lockerValue = JSON.parse(data['locker']);

            let addressSelector = document.querySelector('.address');
            if (null !== addressSelector) {
                addressSelector.innerHTML = '<span style="display:none">'+lockerValue.lockerId +"</span>"+ lockerValue.name + '<br/>' +lockerValue.address;
            }
        }

        document.querySelector('.step__footer').style.display = "block";
        document.querySelector(".loader").style.display = "none";
        document.getElementById("selected_locker").style.display = "none";

        const boxes = Array.from(document.getElementsByClassName('section'));
        boxes.forEach(box => {
            box.style.display = 'block';
        });
    }

    const showLockerMap = () => {
        document.getElementById("select_locker").style.display = "block";
        document.getElementById("selected_locker").style.display = "block";
        document.querySelector(".loader").style.display = "none";
    }

    setTimeout(function() {
        if(data['lockerSelected']) {
            // The locker was already selected !
            showOrderDetails(data['lockerSelected']);
        } else if (data['error']) {
            // The locker couldn't be selected (Show previous order selection)

            let section = document.createElement('h4');
            document.getElementById('main-header').after(section);
            section.innerHTML = '<strong style="color: darkred; font-weight: bolder"> ' + data['error'] + ' </strong>';

            showOrderDetails();
        } else {
            // Show for client Sameday Map in order to choose a locker
            showLockerMap();
        }
    }, 150);
}
