const installBtn = document.querySelector(".install_asset");
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

