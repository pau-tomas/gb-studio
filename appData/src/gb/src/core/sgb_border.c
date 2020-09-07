#include "sgb_border.h"

#include <string.h>

#include "BankManager.h"
#include "data_ptrs.h"
#include "Math.h"

void LoadSGBData() {
  brdr_chr_ptr_1 = BankDataPtr(SGB_BORDER_TILES_BANK) + SGB_BORDER_TILES_BANK_OFFSET;

  brdr_chr_ptr_2 = 4096 + BankDataPtr(SGB_BORDER_TILES_BANK) + SGB_BORDER_TILES_BANK_OFFSET;

  brdr_map_ptr = BankDataPtr(SGB_BORDER_MAP_BANK) + SGB_BORDER_MAP_BANK_OFFSET;

  brdr_pal_ptr = BankDataPtr(SGB_BORDER_PAL_BANK) + SGB_BORDER_PAL_BANK_OFFSET;
}
