const MAX_RATING = 5;

$(document).ready(function(){
    $(".rank").click();
});

function get_total_rating(li, preference_map) {
    let preference_sum = 0;
    $.each(preference_map, function(metric, pref) {
        preference_sum += parseInt(pref);
    });

    const rating_map = $(li).data();
    let final_rating = 0;
    $.each(preference_map, function(metric, pref) {
        final_rating += (
            rating_map[metric] / MAX_RATING *
            pref / preference_sum
        )
    });
    return final_rating;
}

function rank() {
    let ul = $("#places");
    let li = ul.children("li");

    let preferences = $("#preferences").children("input");
    let preference_map = {};
    $.each(preferences, function(i, pref) {
        preference_map[pref.name] = pref.value;
    });

    li.detach().sort(function(a, b) {
        const a_rating = get_total_rating(a, preference_map);
        const b_rating = get_total_rating(b, preference_map);
        if (a_rating > b_rating) {
            return -1;
        } else if (a_rating == b_rating) {
            return 0;
        }
        return 1;
    });
    ul.append(li);
}
