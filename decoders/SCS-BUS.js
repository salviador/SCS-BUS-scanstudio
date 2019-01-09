/*
*************************************************************************************

							SCANASTUDIO 2 DECODER

The following commented block allows some related informations to be displayed online

<DESCRIPTION>

	

</DESCRIPTION>

<RELEASE_NOTES>

	V1.0:  Initial release

</RELEASE_NOTES>

<AUTHOR_URL>

	

</AUTHOR_URL>

<HELP_URL>



</HELP_URL>

*************************************************************************************
*/

/* The decoder name as it will apear to the users of this script 
*/
function get_dec_name()
{
	return "SCS-BUS";
}

/* The decoder version 
*/
function get_dec_ver()
{
	return "1.0";
}

/* Author 
*/
function get_dec_auth()
{
	return "MICHELE MANCINI";
}

/* graphical user interface
*/
function gui()  //graphical user interface
{
	ui_clear();  // clean up the User interface before drawing a new one.

	ui_add_ch_selector( "ch", "Channel to decode", "SCS" );

	ui_add_txt_combo( "invert", "Inverted logic" );
		ui_add_item_to_txt_combo( "Non inverted logic (default)", true );
		ui_add_item_to_txt_combo( "Inverted logic: All signals inverted" );
		ui_add_item_to_txt_combo( "Inverted logic: Only data inverted" );
	
}


function decode()
{
    var s_pos, p_pos, b, s, val;
	var par;
	var spb; 				// samples per bit
	var m; 					// margin between blocks
	var logic1, logic0;
	var bit;
		
		
	get_ui_vals();                // Update the content of user interface variables
	clear_dec_items();            // Clears all the the decoder items and its content

	var t = trs_get_first(ch);
	//debug("trs_get_first: " + t.val);


	spb = sample_rate / 9600; 		// calculate the number of Samples Per Bit. Hz
	m = spb / 10; 					// margin = 1 tenth of a bit time (expresed in number of samples)

	//debug("sample_rate: " + sample_rate);
	//debug("TIME Bit: " + spb);


	var PKT_COLOR_DATA         = get_ch_light_color(ch);
	var PKT_COLOR_DATA_TITLE   = dark_colors.gray;
	var PKT_COLOR_START_TITLE  = dark_colors.blue;
	var PKT_COLOR_PARITY_TITLE = dark_colors.orange;
	var PKT_COLOR_STOP_TITLE   = dark_colors.green;	
	
	while (trs_is_not_last(ch))
	{

		if (abort_requested() == true)
		{
			pkt_end();
			return false;
		}

		if(invert == 0){
			//debug("Not Invert LOGIC");
			t = get_next_falling_edge (ch, t);		

			//debug("get_next_falling_edge: " + ch + " ", t.val);
	
		}else{
			//debug("Invert LOGIC");
			t = get_next_rising_edge (ch, t);		

			//debug("get_next_rising_edge: t.val " + t.val);
			//debug("get_next_rising_edge: t.sample " + t.sample);
		}



		//****************PRESTART****************
		bit_sampler_ini(ch, spb / 7, spb);
/*		var scs_start = bit_sampler_next(ch);

		if(invert == 0){
			if(scs_start == 0){
				debug("scs_start: " +  scs_start);
			}else{
				dec_item_add_pre_text("Start bit Missing!");
				dec_item_add_comment("Start bit Missing!");
	
				pkt_add_item(-1, -1, "MISSING START", " ", PKT_COLOR_STOP_TITLE, PKT_COLOR_DATA, true, ch);
			}
		}else{
			if(scs_start == 1){
				debug("scs_start: " +  scs_start);
				
			}else{
				dec_item_add_pre_text("Start bit Missing!");
				dec_item_add_comment("Start bit Missing!");
	
				pkt_add_item(-1, -1, "MISSING START", " ", PKT_COLOR_STOP_TITLE, PKT_COLOR_DATA, true, ch);
			}
		}
*/

		//***********************START BIT***********************
		var scs_start1 = bit_sampler_next(ch);
		if(invert == 0){
			if(scs_start1 == 0){
				//debug("scs_start1: " +  scs_start1);
			}else{
				dec_item_add_pre_text("Start bit Missing!");
				dec_item_add_comment("Start bit Missing!");
	
				pkt_add_item(-1, -1, "MISSING START", " ", PKT_COLOR_STOP_TITLE, PKT_COLOR_DATA, true, ch);
			}
		}else{
			if(scs_start1 == 1){
				//debug("scs_start1: " +  scs_start1);
				
			}else{
				dec_item_add_pre_text("Start bit Missing!");
				dec_item_add_comment("Start bit Missing!");
	
				pkt_add_item(-1, -1, "MISSING START", " ", PKT_COLOR_STOP_TITLE, PKT_COLOR_DATA, true, ch);
			}
		}



		if (trs_is_not_last(ch) == false)
		{
			break;
		}

		pkt_start("SCS (CH " + (ch+1) + ")");
		//dec_item_new(ch, t.sample + (spb / 7), t.sample + (spb / 7) + spb ); 		// add the start bit item
		dec_item_new(ch, t.sample , t.sample + spb - (spb / 10)); 		// add the start bit item
		dec_item_add_pre_text("Start");	
		dec_item_add_pre_text("S");
		dec_item_add_comment("Start");

		//dec_item_new(ch, t.sample + (spb / 7) + spb, t.sample + (spb / 7) + spb * 8);
		dec_item_new(ch, t.sample + spb, t.sample  + spb * 9 - (spb / 10));

		var midSample = t.sample + spb + (spb / 7);	// position our reader on the middle of first bit

			val = 0;

			for (b = 0; b < 8; b++)
			{
				bit = bit_sampler_next(ch);
				//debug("bit = bit_sampler_next(ch); " + bit);
				//debug("t.sample " + t.sample);

				if (invert > 0)
				{
					bit = bit ^ 1;
				}
			
				val += Math.pow(2, b) * bit;
				dec_item_add_sample_point(ch, midSample, bit ? DRAW_1 : DRAW_0);
				midSample += spb;
			}

		var asciiChar = String.fromCharCode(val);
		var strHexData = int_to_str_hex(val);

		if (val >= 0x20)
		{
			strHexData += " '" + asciiChar + "'";
		}

		dec_item_add_data(val);
		dec_item_add_comment(strHexData);

		pkt_add_item(-1, -1, "DATA", strHexData, PKT_COLOR_DATA_TITLE, PKT_COLOR_DATA, true, ch);
		
		hex_add_byte(ch, -1, -1, val);
		

		t.sample += (spb * (8 + 1));

		dec_item_new(ch, t.sample + m, t.sample + (spb * 1) - m);	// add stop bit

		r_stop = bit_sampler_next(ch);
		if (invert > 0)
		{
			if(r_stop == 0){
				dec_item_add_pre_text("Stop");
				dec_item_add_pre_text("P");
				dec_item_add_comment("Stop");
			}else{
				dec_item_add_pre_text("Stop bit Missing!");
				dec_item_add_pre_text("No Stop!");
				dec_item_add_pre_text("No P!");
				dec_item_add_pre_text("P!");
				dec_item_add_comment("Stop bit Missing!");
	
				pkt_add_item(-1, -1, "MISSING STOP", " ", PKT_COLOR_STOP_TITLE, PKT_COLOR_DATA, true, ch);
			}
		}else{
			if(r_stop == 1){
				dec_item_add_pre_text("Stop");
				dec_item_add_pre_text("P");
				dec_item_add_comment("Stop");
			}else{
				dec_item_add_pre_text("Stop bit Missing!");
				dec_item_add_pre_text("No Stop!");
				dec_item_add_pre_text("No P!");
				dec_item_add_pre_text("P!");
				dec_item_add_comment("Stop bit Missing!");
	
				pkt_add_item(-1, -1, "MISSING STOP", " ", PKT_COLOR_STOP_TITLE, PKT_COLOR_DATA, true, ch);
			}
		}

		pkt_end();

		if (typeof(pkt_start) != "undefined") 		// If older ScanaStudio version
		{
			t = trs_go_after(ch,t.sample + (spb * 1 * 0.5));
		}
		else
		{

			t = bit_sampler_get_last_trans(ch);	 	// get last navigator position from the bit sampler.
		}

		set_progress(100 * t.sample / n_samples);





	
	
	
	}	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
}







/* Get next transition with falling edge
*/
function get_next_falling_edge (ch, trStart)
{
	var tr = trStart;
	
	while ((tr.val != FALLING) && (trs_is_not_last(ch) == true))
	{
		tr = trs_get_next(ch);	// Get the next transition
	}

	if (trs_is_not_last(ch) == false) tr = false;

	return tr;
}
function get_next_rising_edge (ch, trStart)
{
	var tr = trStart;

	while ((tr.val != RISING) && (trs_is_not_last(ch) == true))
	{
		//debug("[get_next_rising_edge] " + tr.val);
		tr = trs_get_next(ch);	// Get the next transition
	}

	if (trs_is_not_last(ch) == false) tr = false;

	return tr;
}


function int_to_str_hex (num) 
{
	var temp = "0x";

	if (num < 0x10)
	{
		temp += "0";
	}

	temp += num.toString(16).toUpperCase();

	return temp;
}

function get_ch_light_color (k)
{
    var chColor = get_ch_color(k);

    chColor.r = (chColor.r * 1 + 255 * 3) / 4;
    chColor.g = (chColor.g * 1 + 255 * 3) / 4;
    chColor.b = (chColor.b * 1 + 255 * 3) / 4;

    return chColor;
}


