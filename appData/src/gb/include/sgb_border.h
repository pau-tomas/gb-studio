#ifndef SGB_BORDER_H
#define SGB_BORDER_H

#include <gb/gb.h>
#include <gb/sgb.h>

unsigned char* brdr_chr_ptr_1; 
unsigned char* brdr_chr_ptr_2; 
unsigned char* brdr_map_ptr; 
unsigned char* brdr_pal_ptr; 

void LoadSGBData();
void init_sgb();
UBYTE check_sgb2();

#endif
