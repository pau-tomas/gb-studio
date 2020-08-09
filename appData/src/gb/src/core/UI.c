#include "UI.h"

#include <stdio.h>
#include <string.h>

#include "BankData.h"
#include "BankManager.h"
#include "GameTime.h"
#include "Input.h"
#include "Math.h"
#include "data_ptrs.h"

void UIInit_b();
void UIUpdate_b();
void UIReset_b();
void UIDrawFrame_b(UBYTE x, UBYTE y, UBYTE width, UBYTE height);
void UIDrawDialogueFrame_b(UBYTE h);
void UISetColor_b(UWORD image_index);
void UIShowText_b();
void UIOnInteract_b();
void UIShowMenu_b(UWORD flag_index,
                  UBYTE bank,
                  UWORD bank_offset,
                  UBYTE layout,
                  UBYTE cancel_config);
void UIDrawMenuCursor_b();
void UIDrawText_b(UBYTE index);
void UIDrawTile_b(UBYTE value, UBYTE max, UBYTE index);

UBYTE ui_block = FALSE;
UBYTE win_pos_x;
UBYTE win_pos_y;
UBYTE win_dest_pos_x;
UBYTE win_dest_pos_y;
UBYTE win_speed;

UBYTE text_x;
UBYTE text_y;
UBYTE text_drawn;
UBYTE text_count;
UBYTE text_tile_count;
UBYTE text_wait;
UBYTE text_in_speed = 1;
UBYTE text_out_speed = 1;
UBYTE text_draw_speed = 1;
UBYTE text_ff_joypad = J_A | J_B;
UBYTE tmp_text_in_speed = 1;
UBYTE tmp_text_out_speed = 1;
UBYTE text_num_lines = 0;

UBYTE avatar_enabled = 0;
UBYTE menu_enabled = FALSE;
BYTE menu_index = 0;
UWORD menu_flag;
UBYTE menu_num_options = 2;
UBYTE menu_cancel_on_last_option = TRUE;
UBYTE menu_cancel_on_b = TRUE;
UBYTE menu_layout = FALSE;

unsigned char text_lines[80] = "";
unsigned char tmp_text_lines[80] = "";

UBYTE overlay_tile_count = 0;
UIElement ui_elements[256];

void UIInit() {
  PUSH_BANK(UI_BANK);
  ui_block = FALSE;
  text_drawn = TRUE;
  UIInit_b();
  POP_BANK;
}

void UIUpdate() {
  PUSH_BANK(UI_BANK);
  UIUpdate_b();
  POP_BANK;
}

void UIReset() {
  PUSH_BANK(UI_BANK);
  UIReset_b();
  POP_BANK;
}

void UIDrawFrame(UBYTE x, UBYTE y, UBYTE width, UBYTE height) {
  PUSH_BANK(UI_BANK);
  UIDrawFrame_b(x, y, width, height);
  POP_BANK;
}

void UIDrawDialogueFrame(UBYTE h) {
  PUSH_BANK(UI_BANK);
  UIDrawDialogueFrame_b(h);
  POP_BANK;
}

void UIDrawText(UBYTE bank, UWORD bank_offset, UBYTE index)
{
  UBYTE* ptr;

  strcpy(tmp_text_lines, "");

  ptr = (BankDataPtr(bank)) + bank_offset;

  PUSH_BANK(bank);
  strcat(tmp_text_lines, ptr);
  POP_BANK;

  PUSH_BANK(UI_BANK);
  UIDrawText_b(index);
  POP_BANK;
}

void UIDrawTile(UBYTE bank, UWORD bank_offset, UBYTE value, UBYTE max, UBYTE index)
{
  UBYTE* ptr;

  strcpy(tmp_text_lines, "");

  ptr = (BankDataPtr(bank)) + bank_offset;

  PUSH_BANK(bank);
  strcat(tmp_text_lines, ptr);
  POP_BANK;

  PUSH_BANK(UI_BANK);
  UIDrawTile_b(value, max, index);
  POP_BANK;
}

void UIDrawHUD() 
{
  BankPtr hud_bank_ptr;
  UBYTE* hud_ptr;
  UBYTE i, tileset_index, hud_width, hud_height;
  
  BankPtr tileset_bank_ptr;
  UBYTE* tileset_ptr;
  UBYTE tileset_size;

  BankPtr ui_element_bank_ptr;
  UBYTE* element_ptr;

  ReadBankedBankPtr(DATA_PTRS_BANK, &hud_bank_ptr, (BankPtr*)&hud_bank_ptrs);
  hud_ptr = (BankDataPtr(hud_bank_ptr.bank)) + hud_bank_ptr.offset;
  tileset_index = ReadBankedUBYTE(hud_bank_ptr.bank, hud_ptr);
  hud_width = ReadBankedUBYTE(hud_bank_ptr.bank, hud_ptr + 1u);
  hud_height = ReadBankedUBYTE(hud_bank_ptr.bank, hud_ptr + 2u);
  PUSH_BANK(hud_bank_ptr.bank);
  set_win_tiles(0, 0, hud_width, hud_height, hud_ptr + 3u);
  POP_BANK;

  // Load Image Tileset
  ReadBankedBankPtr(DATA_PTRS_BANK, &tileset_bank_ptr, &tileset_bank_ptrs[tileset_index]);
  tileset_ptr = (BankDataPtr(tileset_bank_ptr.bank)) + tileset_bank_ptr.offset;
  tileset_size = ReadBankedUBYTE(tileset_bank_ptr.bank, tileset_ptr);
  SetBankedBkgData(tileset_bank_ptr.bank, HUD_BUFFER_START, tileset_size, tileset_ptr + 1u);

  overlay_tile_count = tileset_size;

  ReadBankedBankPtr(DATA_PTRS_BANK, &ui_element_bank_ptr, &ui_element_bank_ptrs[0]);
  element_ptr = (BankDataPtr(ui_element_bank_ptr.bank)) + ui_element_bank_ptr.offset;
  for (i = 0; i < NUM_UI_ELEMENTS; i++)
  {
    ui_elements[i].pos.x = ReadBankedUBYTE(ui_element_bank_ptr.bank, element_ptr + i * 2);
    ui_elements[i].pos.y = ReadBankedUBYTE(ui_element_bank_ptr.bank, element_ptr + 1 + i * 2);
  }
}

void UIShowText(UBYTE bank, UWORD bank_offset) {
  UBYTE* ptr;

  strcpy(tmp_text_lines, "");

  ptr = (BankDataPtr(bank)) + bank_offset;

  PUSH_BANK(bank);
  strcat(tmp_text_lines, ptr);
  POP_BANK;

  PUSH_BANK(UI_BANK);
  UIShowText_b();
  POP_BANK;
}

void UIShowAvatar(UBYTE avatar_index) {
  BankPtr avatar_bank_ptr;
  UBYTE* avatar_ptr;
  UBYTE avatar_len;
  UBYTE tile1, tile2, tile3, tile4;

  unsigned char* tmp_avatar_ptr[100];

  ReadBankedBankPtr(DATA_PTRS_BANK, &avatar_bank_ptr, &avatar_bank_ptrs[avatar_index]);
  avatar_ptr = (BankDataPtr(avatar_bank_ptr.bank)) + avatar_bank_ptr.offset;
  avatar_len = MUL_4(ReadBankedUBYTE(avatar_bank_ptr.bank, avatar_ptr));

  PUSH_BANK(avatar_bank_ptr.bank);
  memcpy(tmp_avatar_ptr, avatar_ptr + 1, avatar_len * 16);
  POP_BANK
  SetBankedBkgData(FONT_BANK, TEXT_BUFFER_START, avatar_len, (unsigned char *)tmp_avatar_ptr);

  tile1 = TEXT_BUFFER_START;
  tile2 = TEXT_BUFFER_START + 1U;
  tile3 = TEXT_BUFFER_START + 2U;
  tile4 = TEXT_BUFFER_START + 3U;

  set_win_tiles(1, 1, 1, 1, &tile1);
  set_win_tiles(2, 1, 1, 1, &tile2);
  set_win_tiles(1, 2, 1, 1, &tile3);
  set_win_tiles(2, 2, 1, 1, &tile4);
}

void UIShowChoice(UWORD flag_index, UBYTE bank, UWORD bank_offset) {
  PUSH_BANK(UI_BANK);
  UIShowMenu_b(flag_index, bank, bank_offset, 0,
               MENU_CANCEL_ON_B_PRESSED | MENU_CANCEL_ON_LAST_OPTION);
  POP_BANK;
}

void UIShowMenu(UWORD flag_index,
                UBYTE bank,
                UWORD bank_offset,
                UBYTE layout,
                UBYTE cancel_config) {
  PUSH_BANK(UI_BANK);
  UIShowMenu_b(flag_index, bank, bank_offset, layout, cancel_config);
  POP_BANK;
}

void UISetPos(UBYTE x, UBYTE y) {
  win_pos_x = x;
  win_dest_pos_x = x;
  win_pos_y = y;
  win_dest_pos_y = y;
}

void UIMoveTo(UBYTE x, UBYTE y, UBYTE speed) {
  win_dest_pos_x = x;
  win_dest_pos_y = y;
  if (speed == 0) {
    win_pos_x = x;
    win_pos_y = y;
  } else {
    win_speed = speed;
  }
}

UBYTE UIIsClosed() {
  return win_pos_y == MENU_CLOSED_Y && win_dest_pos_y == MENU_CLOSED_Y;
}

void UIOnInteract() {
  PUSH_BANK(UI_BANK);
  UIOnInteract_b();
  POP_BANK;
}

UBYTE UIAtDest() {
  return win_pos_x == win_dest_pos_x && win_pos_y == win_dest_pos_y;
}

void UISetColor(UBYTE color) {
  PUSH_BANK(UI_BANK);
  UISetColor_b(color);
  POP_BANK;
}
