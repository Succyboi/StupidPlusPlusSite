//for setting colors
var pear36Col0 = ["#f2a65e", "#8fde5d", "#4b5bab", "#ff6b97"];
var pear36Col1 = ["#ba6156", "#3ca370", "#473b78", "#bd4882"];
var root = document.documentElement;

var col0 = Math.floor(Math.random() * pear36Col0.length);
var col1 = Math.floor(Math.random() * pear36Col1.length);

while (col1 == col0)
{
    col1 = Math.floor(Math.random() * pear36Col1.length);
}

root.style.setProperty("--color0", pear36Col0[col0]);
root.style.setProperty("--color1", pear36Col1[col1]);

// For highlighting tabs
var btns = document.getElementsByClassName("tabbtn");

for (var i = 0; i < btns.length; i++) {
    btns[i].addEventListener("click", function() {
    var current = document.getElementsByClassName("selected");
    current[0].className = current[0].className.replace(" selected", "");
    this.className += " selected";
    });
}

//for switching tabs
function EnableTab(tabIndex)
{            

    for(var t = 0; t < document.getElementsByClassName("window-content").length; t++)
    {
        if(t == tabIndex)
        {
            var tab = document.getElementById("tab" + t.toString());
            if(tab != null)
            {
                tab.className = tab.className.replace(" hide", "");
            }

        }
        else
        {
            var tab = document.getElementById("tab" + t.toString());
            if(tab != null)
            {
                if(!tab.className.includes(" hide"))
                {
                    tab.className += " hide";
                }
            }
        }
    }
}

//code of the day
var codeOfTheDays = ["Blurry.cs", "Compressor.cs", "UnlitColorDoodle.shader", "VoiceChat.cs"];

function LoadCodeOfTheDay()
{
    var now = new Date();
    var start = new Date(now.getFullYear(), 0, 0);
    var diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    var oneDay = 1000 * 60 * 60 * 24;
    var day = Math.floor(diff / oneDay);

    //var index = Math.floor(Math.random() * codeOfTheDays.length);
    var index = Math.floor(((Math.sin(day) * 43758.5453123) - Math.trunc(Math.sin(day) * 43758.5453123)) * codeOfTheDays.length);//1d pseudorandom borrowed from glsl because who cares

    console.log(index);

    var client = new XMLHttpRequest();
    client.open('GET', "codeoftheday/" + codeOfTheDays[index]);
    client.onreadystatechange = function()
    {
        var cotd = client.responseText;

        cotd = cotd.split("\n").join("\n</code><code>");
        cotd = "<pre><code>And the code of the day is... </code>\n<code><a class=\"cool\" href=\"" + "codeoftheday/" + codeOfTheDays[index] +"\" target=\"_blank\">" + codeOfTheDays[index] + "</a></code>\n<code>\n<code></code>" + cotd + "</code></pre>";

        var tab = document.getElementById("tab3");

        tab.innerHTML = cotd;
    }
    client.send();
}