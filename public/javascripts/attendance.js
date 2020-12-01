$(document).ready(function(){
    $('#hours').select2();
    $("#start_id").datetimepicker({
        format  : 'yyyy-mm-dd',//显示格式
        minView: "month", //选择日期后，不会再跳转去选择时分秒 
        language: 'zh-CN',
        autoclose: 1,//选择后自动关闭
        clearBtn:true,//清除按钮
    });
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
    $('#submit').click(function(e){
        let data = {};
        let arr = $('form').serializeArray();
        $.each(arr, function() {
            data[this.name] = this.value;
        });
        $.post("/attendance/save",data,function(data,status){
            if (status == 'success') {
                if (data.code == 1000) {
                    console.log(data);
                    let html = "<tr id='attendance_"+data.data.id+"'>";
                    html += '<td>'+data.data.overtime+'</td>';
                    html += '<td>'+data.data.hours+'</td>';
                    html += '<td>'+data.data.used+'</td>';
                    html += '<td>'+data.data.hours+'</td>';
                    html += '<td>'+data.data.status+'</td>';
                    html += '<td><button onclick="delWork('+data.data.id+')">删除</button></td>'
                    html += "</tr>";
                    $('#table').append(html);
                }else{
                    alert(data.msg)
                }
            }else{
                alert(data)
            }
        });
    });
});