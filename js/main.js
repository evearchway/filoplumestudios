window.onload = function(){
    keyPressSetup();
}






















//Night Mode Colors
function switchToDayMode(){
    $(document.documentElement).css('--main-background', '#fff');
        $(document.documentElement).css('--main-text', '#000');
        nightMode.set(false);
    }
    function switchToNightMode(){
        $(document.documentElement).css('--main-background', '#000');
        $(document.documentElement).css('--header-background', '#010101');
        $(document.documentElement).css('--main-text', '#a72'); // save color #952 for later, I really like it
        $(document.documentElement).css('--light-text', '#730');
    nightMode.set(true);
    }
    if(nightMode.get()){
        switchToNightMode();
    }