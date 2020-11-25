$(document).ready(()=>{
    $('#hiddenUrl').click(function(e){
        let hidden_status = $(this).attr('var-hidden');
        if (hidden_status == 0) {
            $('.wUrl').hide();
            $(this).attr('var-hidden', 1);
            $(this).html('显示url');
        }else{
            $('.wUrl').show();
            $(this).attr('var-hidden', 0);
            $(this).html('隐藏url');
        }
    });
});