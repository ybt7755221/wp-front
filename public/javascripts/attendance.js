$(function(){
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
            $.alert({
                title:"",
                type: 'blue',
                content:'此调休还未使用'
            });
            return
        }
        $.get("/attendance/getDayoff", { 
            attendance_id: id
        },function(data){
            if (data.code == 1000) {
                let num = data.data.length
                let html = '<table class="table table-striped"><tr><td>休假时间</td><td>休假时长</td><td>休假原因</td></tr>';
                for (let i = 0; i < num; i++) {
                    html += '<tr><td>'+data.data[i].dayoff+'</td><td>'+data.data[i].hours+'</td><td>'+data.data[i].backup+'</td></tr>';
                }
                html += '</table>';
                $.confirm({
                    title:"使用详情",
                    columnClass: 'medium',
                    type:"blue",
                    boxWidth: '500px',
                    content: html
                });
            }else{
                $.alert({
                    title:"错误",
                    type: 'red',
                    content:data.msg
                });
            }
        });
    });
    $('.hideBtn').click(function(event){
        let trKey = '#info_' + $(this).attr('var-id');
        $(trKey).attr('class', 'well hidden');
    });
    $('#submit').click(function(event){
        let data = {};
        let arr = $('form').serializeArray();
        $.each(arr, function() {
            data[this.name] = this.value;
        });
        if (data['overtime'] == "" || data['hours'] == "") {
            $.alert({
                title:"错误",
                type: 'red',
                content:'必填字段不能为空!'
            });
        } else {
            $.post("/attendance/save",data,function(data,status){
                if (status == 'success') {
                    if (data.code == 1000) {
                        let html = "<tr id='attd_"+data.data.id+"'>";
                        html += '<td>'+data.data.overtime+'</td>';
                        html += '<td>'+data.data.hours+'</td>';
                        html += '<td>'+data.data.used+'</td>';
                        html += '<td>'+data.data.hours+'</td>';
                        html += '<td>'+data.data.status+'</td>';
                        html += '<td><a var-id="'+data.data.id+'" class="delBtn">删除</a></td>'
                        html += "</tr>";
                        $('#table').append(html);
                    }else{
                        $.alert({
                            title:"错误",
                            type: 'red',
                            content:data.msg
                        })
                    }
                }else{
                    $.alert({
                        title:"错误",
                        type: 'red',
                        content:data
                    })
                }
            });
        }
    });
    $('.table').on('click', '.delBtn', function(event){
        let id = $(this).attr('var-id');
        $.confirm({
            title: '删除',
            type: 'green',
            content: '确定删除？',
            buttons: {
                confirm: function () {
                    $.post("/attendance/delete",{id:id},function(data,status){
                        if (status == 'success') {
                            if (data.code == 1000) {
                                $.post("/attendance/delete-dayoff",{attendance_id:id},function(data, status){
                                    console.log(data);
                                    console.log(status);
                                });
                                $('#attd_'+id).remove();
                            }else{
                                $.alert({
                                    title:"错误",
                                    type: 'red',
                                    content:data.msg
                                });
                            }
                        }else{
                            $.alert({
                                title:"错误",
                                type: 'red',
                                content:data
                            });
                        }
                    });
                },
                cancel: function () {
                }
            }
        });        
    });
    $('.dayoffBtn').click(function(event){
        let id = $(this).attr('var-id');
        $('#attId').val(id);
        $('#dayoffModal').modal('show');
    });
    $('#submit-dayoff').click(function(event){
        let data = {};
        let arr = $('form').serializeArray();
        $.each(arr, function() {
            data[this.name] = this.value;
        });
        if (data['dayoff'] == "" || data['hours'] == "") {
            $.alert({
                title:"错误",
                type: 'red',
                content:'必填字段不能为空!'
            });
        } else {
            $.post("/attendance/save-dayoff",data,function(data,status){
                if (status == 'success') {
                    if (data.code == 1000) {
                        window.location.href='/attendance';
                    }else{
                        $.alert({
                            title:"错误",
                            type: 'red',
                            content:data.msg
                        });
                    }
                }else{
                    $.alert({
                        title:"错误",
                        type: 'red',
                        content:data
                    });
                }
            });
        }
    });
});