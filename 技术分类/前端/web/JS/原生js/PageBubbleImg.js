/**
 * ๐๐๐๐๐๐๐๐คฃโบ๐๐๐๐๐๐๐๐๐๐๐๐๐๐๐๐ค๐ค๐ค๐๐คก๐ค ๐๐ฃโน๐๐๐๐
 */
var oldOnload=window.onload;

onload = function() {
    var click_cnt = 0;
    var $html = document.getElementsByTagName("html")[0];
    var $body = document.getElementsByTagName("body")[0];
    $html.onclick = function(e) {
        var $elem = document.createElement("b");
        $elem.style.color = "#E94F06";
        $elem.style.zIndex = 9999;
        $elem.style.position = "absolute";
        $elem.style.select = "none";
        var x = e.pageX;
        var y = e.pageY;
        $elem.style.left = (x - 10) + "px";
        $elem.style.top = (y - 20) + "px";
        clearInterval(anim);
        switch (++click_cnt) {
            case 10:
                $elem.innerText = "OฯO";
                break;
            case 20:
                $elem.innerText = "(เนโขฬ โ โขฬเน)";
                break;
            case 30:
                $elem.innerText = "(เนโขฬ โ โขฬเน)";
                break;
            case 40:
                $elem.innerText = "(เนโขฬ_โขฬเน)";
                break;
            case 50:
                $elem.innerText = "๏ผ๏ฟฃใธ๏ฟฃ๏ผ";
                break;
            case 60:
                $elem.innerText = "(โฏยฐๅฃยฐ)โฏ(โดโโด";
                break;
            case 70:
                $elem.innerText = "เซฎ( แตฬ็ฟแตฬ )แ";
                break;
            case 80:
                $elem.innerText = "โฎ(๏ฝก>ๅฃ<๏ฝก)โญ";
                break;
            case 90:
                $elem.innerText = "( เธ แตฬ็ฟแตฬ)เธโผยณโโ";
                break;
            case 100:
            case 101:
            case 102:
            case 103:
            case 104:
            case 105:
                $elem.innerText = "(๊ฆยฐแทะดยฐแท)";
                break;
            default:
		// ๆๅจๆดๆขไธ้ข่ฟ่กๅๅผๅท้้ข็ๅๅฎน ๅฆ"๐"
                $elem.innerText = "๐";
                break;
        }
        $elem.style.fontSize = Math.random() * 10 + 8 + "px";
        var increase = 0;
        var anim;
        setTimeout(function() {
        	anim = setInterval(function() {
	            if (++increase == 150) {
	                clearInterval(anim);
			$body.removeChild($elem);
	            }
	            $elem.style.top = y - 20 - increase + "px";
	            $elem.style.opacity = (150 - increase) / 120;
	        }, 8);
        }, 70);
        $body.appendChild($elem);
    };
    oldOnload.apply(this,arguments)
};