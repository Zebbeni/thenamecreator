/**
 * Created by andrewalbers on 11/5/16.
 */

var profile = undefined;
var username = undefined;

var onSignIn = function(googleUser) {
    var id_token = googleUser.getAuthResponse().id_token;
    profile = googleUser.getBasicProfile();
    username = profile.getGivenName();
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getGivenName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail());
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/signin');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onload = function() {
        console.log('Signed in as: ' + xhr.responseText);
        // console.log("id_token:", id_token);
    };
    xhr.send('idtoken=' + id_token);
    $('a#signin-a').text("");
    $('a#profile-a').text(username + " ");
    $('a#signout-a').text("(Sign Out)");
    closeSignInOptions();
};

var signOut = function() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        $('a#signin-a').text("Sign In");
        $('a#profile-a').text("");
        $('a#signout-a').text("");
    });
};

var showSignIn = function() {
    $('#signin-div').show();
};

var closeSignInOptions = function() {
    $('#signin-div').hide();
};

var showProfile = function() {
    console.log("show profile placeholder");
};