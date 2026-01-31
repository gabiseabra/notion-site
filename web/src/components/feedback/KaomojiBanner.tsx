import { shuffle } from "@notion-site/common/utils/array.js";
import { ReactNode, useMemo } from "react";
import { Text } from "../display/Text.js";
import { Col } from "../layout/FlexBox.js";

export function KaomojiBanner({ children }: { children: ReactNode }) {
  const kaomoji = useMemo(
    () =>
      shuffle([
        "∘ ∘ ∘ ( °ヮ° ) ?",
        "(╥﹏╥)",
        "｡°(°.◜ᯅ◝°)°｡",
        "(｡ᵕ ◞ _◟)",
        "( ‘• ω • `)",
        "(ง ͠ಥ_ಥ)ง",
        "ᕦ(˵ಥ_ಥ)ᕤ",
        "⁽⁽(੭ꐦ •̀Д•́ )੭*⁾⁾",
        "(๑•̀ㅁ•́๑)✧",
        "(๑•́o•̀๑)",
        "( ｡ •̀ ᴖ •́ ｡)",
        "(ノಠ益ಠ)ノ彡┻━┻",
        "(ಥ益ಥ)ノ彡┻━┻",
        "(｡•ˇ‸ˇ•｡)",
        "(💧́ಠ‸ಠ )",
        "(ꐦ•̀ㅁ•́) ! ! !",
        "(ಠ ʖ̯ ಠ)",
        "(ಥ﹏ಥ)ノ",
        "(ᕤಠᗣಠ)ᕤ",
        "(🤌ಠ益ಠ)🤌",
      ]).pop()!,
    [],
  );

  return (
    <Col flex={1} alignX="center" alignY="center">
      <div style={{ textAlign: "center" }}>
        <Text as="p" size="h1">
          {kaomoji}
        </Text>

        <p>&nbsp;</p>

        <Text as="h3">Damn,</Text>

        {children}
      </div>
    </Col>
  );
}
