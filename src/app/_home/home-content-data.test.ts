import { describe, expect, it } from "vitest";
import { homeEditorsPicks, homeFeaturedWineries } from "@/data/home";
import { winterTipsGeneral, winterTipsHiking, winterTipsPractical } from "@/data/winter-tips";
import el from "../../../messages/el.json";
import en from "../../../messages/en.json";

const insiderTipIds = [
  ...winterTipsGeneral,
  ...winterTipsHiking,
  ...winterTipsPractical,
].map((t) => t.id);

describe("home content i18n keys", () => {
  it("en and el have editors picks keys for all home picks", () => {
    for (const pick of homeEditorsPicks) {
      const enItem = en.home.editorsPicks.items[pick.id as keyof typeof en.home.editorsPicks.items];
      const elItem = el.home.editorsPicks.items[pick.id as keyof typeof el.home.editorsPicks.items];
      expect(enItem?.title).toBeTruthy();
      expect(elItem?.title).toBeTruthy();
      expect(elItem?.desc).toBeTruthy();
    }
  });

  it("en and el have featured winery keys", () => {
    for (const w of homeFeaturedWineries) {
      const enItem =
        en.home.featuredWineries.items[w.wineryId as keyof typeof en.home.featuredWineries.items];
      const elItem =
        el.home.featuredWineries.items[w.wineryId as keyof typeof el.home.featuredWineries.items];
      expect(enItem?.subtitle).toBeTruthy();
      expect(elItem?.subtitle).toBeTruthy();
    }
  });

  it("en and el have insider tip keys for rotation pool", () => {
    for (const id of insiderTipIds) {
      const enTip = en.home.insiderTips[id as keyof typeof en.home.insiderTips];
      const elTip = el.home.insiderTips[id as keyof typeof el.home.insiderTips];
      expect(enTip?.title).toBeTruthy();
      expect(elTip?.title).toBeTruthy();
      expect(elTip?.body).toBeTruthy();
    }
  });

  it("editorsPicks section title exists in el", () => {
    expect(el.home.editorsPicks.title).toBeTruthy();
  });
});
