.include		"sgb_data.s"

	.PAL_01		= 0x00
	.PAL_23		= 0x01
	.PAL_03		= 0x02
	.PAL_12		= 0x03
	.ATTR_BLK	= 0x04
	.ATTR_LIN	= 0x05
	.ATTR_DIV	= 0x06
	.ATTR_CHR	= 0x07
	.SOUND		= 0x08
	.SOU_TRN	= 0x09
	.PAL_SET	= 0x0A
	.PAL_TRN	= 0x0B
	.ATRC_EN	= 0x0C
	.TEST_EN	= 0x0D
	.ICON_EN	= 0x0E
	.DATA_SND	= 0x0F
	.DATA_TRN	= 0x10
	.MLT_REQ	= 0x11
	.JUMP			= 0x12
	.CHR_TRN	= 0x13
	.PCT_TRN	= 0x14
	.ATTR_TRN	= 0x15
	.ATTR_SET	= 0x16
	.MASK_EN	= 0x17
	.OBJ_TRN	= 0x18

	.LCDC		= 0x40	; LCD control
	.SCY		= 0x42	; Scroll Y
	.SCX		= 0x43	; Scroll X
	.BGP		= 0x47	; BG palette data
	.OBP0		= 0x48	; OBJ palette 0 data
	.OBP1		= 0x49	; OBJ palette 1 data

	; LCDCF_OFF 		|   00000000 ; LCD Control Operation
	; LCDCF_ON 			|   10000000 ; LCD Control Operation
	; LCDCF_WIN9800	|   00000000 ; Window Tile Map Display Select
	; LCDCF_WIN9C00 |   01000000 ; Window Tile Map Display Select
	; LCDCF_WINOFF 	|   00000000 ; Window Display
	; LCDCF_WINON 	|   00100000 ; Window Display
	; LCDCF_BG8800 	|   00000000 ; BG & Window Tile Data Select
	; LCDCF_BG8000 	|   00010000 ; BG & Window Tile Data Select
	; LCDCF_BG9800 	|   00000000 ; BG Tile Map Display Select
	; LCDCF_BG9C00 	|   00001000 ; BG Tile Map Display Select
	; LCDCF_OBJ8 		|   00000000 ; OBJ Construction
	; LCDCF_OBJ16 	|   00000100 ; OBJ Construction
	; LCDCF_OBJOFF 	|   00000000 ; OBJ Display
	; LCDCF_OBJON 	|   00000010 ; OBJ Display
	; LCDCF_BGOFF 	|   00000000 ; BG Display
	; LCDCF_BGON 		|   00000001 ; BG Display

	; LCDCF_OFF 		|   00000000 
	; LCDCF_WIN9800 |   00000000 
	; LCDCF_WINOFF 	|   00000000 
	; LCDCF_BG8000 	|   00010000 ; BG & Window Tile Data Select
	; LCDCF_BG9C00 	|   00001000 ; BG Tile Map Display Select
	; LCDCF_OBJOFF 	|   00000000
	; LCDCF_WINOFF 	|   00000000
	; LCDCF_BGON 		|   00000001 
	.LCDCF_INIT 		= 0b00011001

	; LCDCF_ON			|	  10000000
	; LCDCF_WIN9C00	|   01000000
	; LCDCF_WINON		|   00100000
	; LCDCF_BG8000 	|   00010000 ; BG & Window Tile Data Select
	; LCDCF_BG9C00 	|   00001000 ; BG Tile Map Display Select
	; LCDCF_OBJ8		|   00000000
	; LCDCF_OBJON		|   00000010
	; LCDCF_BGON		|   00000001
	.LCDCF_DEFAULT	= 0b11111011

.check_sgb2::
_check_sgb2::
	call .sgb_check
	ld	e,a
	ret

; Super Game Boy initialization
.init_sgb::
_init_sgb::
	call .display_off
	di									; Disable interrupts

	ld	a,#0xE4
	ld	(.BGP),a					
	ld	(.OBP0),a					
	ld	(.OBP1),a					

	call	init_sgb_default	; 8 initialization data packet sending, according to the official documentation

	ld	hl,#.MASK_EN_FREEZE
	call	.sgb_transfer	; Freezes the visualization of the Super Game Boy screen to hide the graphic garbage during the VRAM transfers

	ld	a,#.LCDCF_INIT
	ld	(.LCDC),a			

	ld	a,#0
	ld	(.SCX),a
	ld	(.SCY),a

	call .wait4
	
	; BG Map init
	call	initmem

	; Load brdr_chr_ptr_1 into HL
	ld	a,(_brdr_chr_ptr_1)
	ld	l,a
	ld	a,(_brdr_chr_ptr_1 + 1)
	ld	h,a 

	; ld	hl,#_brdr_chr_ptr
	ld	de,#0x8000 + 0x800
	ld	bc,#0x1000 
	call	copy_to_snes		; Copies to SNES RAM the first 128 tiles of the frame(256 Game Boy tiles)

	call .display_on
	call .wait4
	ld	de,#.CHR_TRN_1
	call .sgb_transfer		; We send the packet that will produce the transfer
	call .display_off

	; Load brdr_chr_ptr_2 into HL
	ld	a,(_brdr_chr_ptr_2)
	ld	l,a
	ld	a,(_brdr_chr_ptr_2 + 1)
	ld	h,a 

	ld	de,#0x8000 + 0x800
	ld	bc,#0x1000 
	call	copy_to_snes		; Copies to SNES RAM the second 128 tiles of the frame(256 Game Boy tiles)

	call .display_on
	call .wait4
	ld	de,#.CHR_TRN_2
	call .sgb_transfer		; We send the packet that will produce the transfer
	call .display_off

	; Load brdr_map_ptr into HL
	ld	a,(_brdr_map_ptr)
	ld	l,a
	ld	a,(_brdr_map_ptr + 1)
	ld	h,a 

	ld	de,#0x8000 + 0x800
	ld	bc,#0x800 
	call	copy_to_snes		; Copies to SNES RAM the frame map

	; Load brdr_pal_ptr into HL
	ld	a,(_brdr_pal_ptr)
	ld	l,a
	ld	a,(_brdr_pal_ptr + 1)
	ld	h,a 

	ld	de,#0x8800 + 0x800
	ld	bc,#0x80 
	call	copy_to_snes		; Copy palette data

	call .display_on
	call .wait4
	ld	de,#.PCT_TRN_0
	call .sgb_transfer		; We send the packet that will produce the transfer
	call .display_off

	; VRAM reset
	ld	de,#0x8000
	ld	bc,#0x2000
	ld	l,#0x0
	call	fillmem

	ld	hl,#.PAL_01_SET
	call .sgb_transfer

	ld	hl,#.MASK_EN_CANCEL
	call .sgb_transfer	; Super Game Boy screen visualization unfreezing
	
	ret

; We send the 8 default initialization data packets specified in the official documentation
init_sgb_default:
	ld	hl,#.DataSnd0
	call	.sgb_transfer
	ld	hl,#.DataSnd1
	call	.sgb_transfer
	ld	hl,#.DataSnd2
	call	.sgb_transfer
	ld	hl,#.DataSnd3
	call	.sgb_transfer
	ld	hl,#.DataSnd4
	call	.sgb_transfer
	ld	hl,#.DataSnd5
	call	.sgb_transfer
	ld	hl,#.DataSnd6
	call	.sgb_transfer
	ld	hl,#.DataSnd7
	call	.sgb_transfer
	ret

; Set the Game Boy VRAM the 4KB data that is going to be transferred to the SNES RAM
;
; @input	HL: Source address
; @input	DE: Destination address
; @input 	BC: Length
copy_to_snes:
copymem:
	ld	a,(hl+)
	ld	(de),a
	inc	de
	dec	bc
	ld	a,c
	or	b
	jr	nz,copymem
ret

.display_on:
	ld	a,#.LCDCF_DEFAULT
	ld	(.LCDC),a
	ret					
	
; Fills a specific number of bytes of one direction with a certain value
;
; @input	DE: Destination address
; @input	BC: Byte number
; @input	L: Fill value
fillmem:
.fillmem_0:
	ld	a,l
	ld	(de),a
	dec	bc
	ld	a,c
	or	b
	ret	z
	inc	de
	jr	.fillmem_0
	ret

; Sets the visible BG Map tiles to point to the 4KB Game Boy VRAM data to transfer
initmem:
	ld	hl,#0x9800				; Copy to the visible BG Bank the 4KB data that is going to be transferred to the SNES RAM by VRAM-transfer
	ld	de,#12						; BG additional width
	ld	a,#0x80						; VRAM address of the first tile
	ld	c,#18							; Rows of data to be copied
.initmem_next_row:
	ld	b,#20							; Visible background width
.initmem_next_tile:
	ld	(hl+),a						; Tile set
	inc	a
	dec	b
	jr	nz,.initmem_next_tile
	add	hl,de							; Next visible background tile row
	dec	c
	jr	nz,.initmem_next_row
	ret

.wait4:
	LD	DE,#99000
1$:
	NOP					; 1 +
	NOP					; 1 +
	NOP					; 1 +
	DEC	DE			; 2 +
	LD	A,D			; 1 +
	OR	E				; 1 +
	JR	NZ,1$		; 3 = 10 cycles
	RET

; --------------------
; SGB Palette Commands

.MASK_EN_CANCEL:
	.byte	.MASK_EN*8|1,0x00,0x00,0x00,0x00,0x00,0x00,0x00
	.byte	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00
.MASK_EN_FREEZE:
	.byte	.MASK_EN*8|1,0x01,0x00,0x00,0x00,0x00,0x00,0x00
	.byte	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00

.CHR_TRN_1:
	.byte	.CHR_TRN*8|1,0x00,0x00,0x00,0x00,0x00,0x00,0x00
	.byte	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00
.CHR_TRN_2:
	.byte	.CHR_TRN*8|1,0x01,0x00,0x00,0x00,0x00,0x00,0x00
	.byte	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00
.PCT_TRN_0:
	.byte .PCT_TRN*8|1,0x00,0x00,0x00,0x00,0x00,0x00,0x00
	.byte	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00

.PAL_01_SET:
	.byte .PAL_01*8|1,0xFF,0x7F,0x1B,0x26,0xD1,0x08,0x22 
	.byte	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00
