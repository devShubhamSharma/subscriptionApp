const installBtn = document.querySelector(".install_asset");
const uninstallBtn = document.querySelector(".uninstall_asset");

installBtn.addEventListener('click', function(){
    $.ajax({
        type: 'POST',
        url: '/install/assets',
        data: { 
            client_shop_token: shop_token,
            client_shop_name: shop_name 
        },
        success: function(response) {
            console.log(response);
        }
    });
});

uninstallBtn.addEventListener('click', function(){
    $.ajax({
        type: 'POST',
        url: '/uninstall',
        data: { 
            client_shop_token: shop_token,
            client_shop_name: shop_name 
        },
        success: function(response) {
            console.log(response);
        }
    });
});

// function themeAssetFile(shop_token,shop_name){
//     const url = "https://"+shop_name+"/admin/api/2021-07/themes.json";
//     fetch(url, {
//     method: 'GET',
//     headers: {
//         'Content-Type': 'application/json',
//         'X-Shopify-Access-Token' : shop_token
//     }
//     })
//     .then(response => response.json())
//     .then(result => {
//     console.log('Success:', result);
//     })
//     .catch(error => {
//     console.error('Error:', error);
//     });
// }
