<?php

function gen(){
	echo gdate()."\t start\n";
	$files = glob("./datatable/*.json");

	$arrgoto = [];
	foreach ($files as $file_num => $file) {
		$arr = json_decode(file_get_contents($file));

		foreach ($arr as $item){
			$arrgoto[md5(json_encode($item))] = [
				'fio'=>$item[0],
				'dob'=>$item[1],
				'addresss'=>$item[2],
			];
		}
	}

	$fp = fopen("./all.csv", 'w');
	$rows = 0;

	fputcsv($fp, array_keys($arrgoto[array_key_first($arrgoto)]),';');
	foreach ($arrgoto as $csvdata) {

		fputcsv($fp, $csvdata,';');
		$rows++;
		//echo gdate()."\t {$rows} - add;\n";
	}
	fclose($fp);
	echo gdate()."\t total: {$rows}\n";

}

function gdate(){
	return date("Y-m-d H:i:s");
}

function setInterval($f, $milliseconds)
{
    $seconds=(int)$milliseconds/1000;
    while(true)
    {
        $f();
        sleep($seconds);
    }
}


setInterval(function(){
    gen();
}, 1000*60*5);
