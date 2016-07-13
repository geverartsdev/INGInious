//
// This file is part of INGInious. See the LICENSE and the COPYRIGHTS files for
// more information about the licensing of this file.
//
"use strict";

function classroom_prepare_submit()
{
    // Check in which mode we are : classrooms or only groups
    if(JSON.parse($("#classrooms").val())) {

        var students = [];
        var groups = [];
        $("#groups .group").each(function(i) {
            var group = {"size": parseInt($(this).find("#size").val()), "students": []};
            $(this).find(".group-entry").each(function(j) {
                var username = $(this).data('username');
                group["students"].push(username);
                students.push(username);
            });

            if(i!=0)  groups.push(group);
        });

        var tutors = [];
        $("#tutors_ .tutor").each(function(i) {
            var tutor = $(this).find("input").val();
            tutors.push(tutor);
        });

        var id = $("#_id").val();
        var description = $("#description").val();
        var cdefault = JSON.parse($("#default").val().toLowerCase());
        var classrooms = [{_id: id, description: description, students: students,
            groups: groups, tutors: tutors, default: cdefault}];

        var inputField = jQuery('<input/>', {
                type:"hidden",
                name:"classrooms",
                value: JSON.stringify(classrooms)
        }).appendTo($("form"));

    } else {

        var classrooms = [];

        var ungrouped = [];
        // for each group/classroom
        $("#groups .group").each(function(i) {
            var students = [];
            var id = $(this).find("#_id").val();
            var description = (i == 0) ? '' : $(this).find("#description").val();
            var group_size = (i == 0) ? 0 : parseInt($(this).find("#size").val());
            var group_students = [];

            $(this).find(".group-entry").each(function (j) {
                var username = $(this).data('username');
                group_students.push(username);
                students.push(username);
            });

            var tutors = [];
            $("#tutors_ .tutor").each(function (i) {
                var tutor = $(this).find("input").val();
                tutors.push(tutor);
            });

            if (i == 0) ungrouped = ungrouped.concat(students);
            else if (i == 1) students = students.concat(ungrouped);

            if (i > 0) {
                var groups = [{size: group_size, students: group_students}];
                var classroom = {_id: id, description: description, students: students,
                    groups: groups, tutors: tutors, default: (i == 1)};
                classrooms.push(classroom);
            }
        });

        if($(".group").length <= 1){
            var classroom = {_id: 'None', description: '', students: ungrouped,
                    groups: [], tutors: [], default: true};
                classrooms.push(classroom);
        }

         var inputField = jQuery('<input/>', {
                type:"hidden",
                name:"classrooms",
                value: JSON.stringify(classrooms)
        }).appendTo($("form"));
    }


}

function classroom_group_add()
{
    // New group hidden item
    var new_group_li = $("#groups .panel").last();

    // Clone and change id for deletion
    var clone = new_group_li.clone();
    clone.find("#tutor_list_" + parseInt(clone.attr("id"))).attr("id", "#tutor_list_" + (parseInt(clone.attr("id")) + 1));
    clone.find("#tutors_" + parseInt(clone.attr("id"))).attr("id", "#tutors_" + (parseInt(clone.attr("id")) + 1));
    clone.attr("id", parseInt(clone.attr("id")) + 1);
    clone.find("#group_number").text(clone.attr("id"));

    // Remove the hidden style attribute and push
    new_group_li.removeAttr("style");
    new_group_li.addClass("group");
    new_group_li.after(clone);

    if(!JSON.parse($("#classrooms").val())) {
        jQuery('<input/>', {
            type:'hidden',
            name: '_id',
            id: '_id',
            value: 'None'
        }).appendTo(new_group_li);
    }

    // Regroup sortable lists
    $("ul.students").sortable({group:"students"});
}

function classroom_group_delete(id)
{
    // Append all the items to ungrouped users
    $("#" + id).find("#students li").each(function(index) {
        $(this).appendTo("#group_0");
    });

    // add the classroom id in delete field
    if(!JSON.parse($("#classrooms").val())) {
        // if group_id is not none, inform to delete
        // do not remove last group id
        if($("#" + id).find("#_id").val() != 'None') {
            jQuery('<input/>', {
                type: 'hidden',
                name: 'delete',
                value: $("#" + id).find("#_id").val()
            }).appendTo($('form'));
        }
    }

    // Remove item...
    $("#" + id).remove();

    // Renumbering groups
    $("#groups .group-panel").each(function(index) {
        $(this).attr("id", index);
        $(this).find("#group_number").text(index+1);
    });
}

function classroom_groups_delete() {
    $("#groups .group").each(function(i) {
        classroom_group_delete($(this).attr("id"));
    });
}

function classroom_groups_clean() {
    $("#groups .group").each(function(i) {
        $("#" + $(this).attr("id")).find("#students li").each(function(index) {
            $(this).appendTo("#group_0");
        });
    });
}

function classroom_tutor_add(username, complete_name, id) {

    // Check if valid entry
    if(username==null)
        return;

    var new_tutor_div = $("#tutors_" + id + " li").last();
    var clone = new_tutor_div.clone();

    new_tutor_div.attr("id", username);
    new_tutor_div.find("span").text(complete_name);

    new_tutor_div.removeAttr("style");
    new_tutor_div.addClass("tutor");
    new_tutor_div.after(clone);

    jQuery('<input/>', {
            type:"hidden",
            name:"tutors",
            value: username
        }).appendTo(new_tutor_div);

    // Add entry in user list for user
    // Remove user from select list and disable select if empty
    $("#tutor_list_" + id + " option[value='"+ username +"']").remove();
    if(!$("#tutor_list_" + id ).val())
        $("#tutor_list_" + id ).prop("disabled", true);
}

function classroom_tutor_remove(username, id) {
    // Put user back to select list
    jQuery('<option/>', {
        value: username,
        text:  $("#" + username).text()
    }).appendTo($("#tutor_list_" + id));

    $("#tutor_list_" + id).prop("disabled", false);

    // Remove user from user list
    $("#" + username).remove();
}

function classroom_student_add() {
    if($("#tab_registered_student").hasClass("active")) {

        var new_li = jQuery('<li/>', {
            'class':"list-group-item group-entry",
            'data-username':$("#registered_students :selected").val()
        });

        jQuery('<span/>', {
            id: new_li.data("username"),
            text: $("#registered_students :selected").text()
        }).appendTo(new_li);

        $("#registered_students :selected").remove();
        if(!$("#registered_students").val())
            $("#registered_students").prop("disabled", true);
    }
    else {
        var new_li = jQuery('<li/>', {
            'class':"list-group-item group-entry",
            'data-username': $("#new_student").val()
        });

        jQuery('<span/>', {
            id: new_li.data("username"),
            text: $("#new_student").val() + ' (will be registered)'
        }).appendTo(new_li);
    }

    var user_del_link = jQuery('<a/>', {
        'class': "pull-right",
        'id': 'user_delete',
        'href': '#',
        'onclick': "javascript:classroom_student_remove('" + new_li.data("username") + "')",
        'data-toggle': 'tooltip',
        'data-placement': 'left',
        'title': 'Remove student'
    });

    jQuery('<i/>', {
        'class': 'fa fa-user-times'
    }).appendTo(user_del_link);

    new_li.append(user_del_link);
    new_li.appendTo($("#group_0"));

    $("#student_modal").modal('hide');
}

function classroom_student_remove(username) {
    jQuery('<option/>', {
        value: username,
        text:  $("#" + username).text()
    }).appendTo($("#registered_students"));

    $("#registered_students").prop("disabled", false);

    $(".group-entry[data-username='" + username + "']").remove();
}

function classroom_delete(id) {
    jQuery('<input/>', {
        type:'hidden',
        name: 'delete',
        value: id
    }).appendTo($('form'));

    $('form').submit();
}