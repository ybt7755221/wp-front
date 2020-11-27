$(document).ready(function(){
    $('.infoBtn').click(function (event) {
        let id = $(this).attr('var-id');
        let attendStatus = $(this).attr('var-status');
        if (attendStatus == 1) {
            alert('此调休还未使用');
            return
        }
        $.get("/attendance/getDayoff", { 
            attendance_id: id
        },function(data){
            if (data.code == 1000) {
                let trKey = '#info_' + id;
                let content ='';
                let num = data.data.length
                for (let i = 0; i < num; i++) {
                    content += '<p>请假时间: '+data.data[i].dayoff+' ||  请假时长: '+data.data[i].hours+'h ||  请假原因: '+data.data[i].backup+'</p>';
                }
                $('.detail').html(content);
                $(trKey).removeClass('hidden');
            }else{
                alert('错误: '+data.msg);
            }
        });
    });
    $('.hideBtn').click(function(event){
        let trKey = '#info_' + $(this).attr('var-id');
        $(trKey).attr('class', 'well hidden');
    });

});