import { hash } from "@notion-site/common/utils/hash.js";
import { FC, ReactNode, useEffect, useState } from "react";
import { IoIosClose } from "react-icons/io";
import { RxCaretLeft } from "react-icons/rx";
import { Link } from "react-router";
import { useEventListener } from "../../../hooks/use-event-listener";
import { useRafThrottledCallback } from "../../../hooks/use-raf-throttled-callback";
import { useResizeObserver } from "../../../hooks/use-resize-observer";
import { SelectionRange } from "../../../utils/selection-range";
import { IconControl } from "../../display/Icon";
import { Span, Text } from "../../display/Text";
import { Button } from "../../inputs/Button";
import { Col, Row } from "../../layout/FlexBox";
import { Popover } from "../../overlays/Popover";
import { Editor } from "../Editor";
import { useEditorTarget } from "../editor/use-editor-target";
import styles from "./Tutorial.module.scss";

export function Tutorial({
  editor,
  onClose,
}: {
  editor: Editor;
  onClose: () => void;
}) {
  const [step, setStep] = useState<Step>("Start");

  const Step = Steps[step];

  return (
    <>
      <Body onClose={onClose}>
        <Step editor={editor} setStep={setStep} onClose={onClose} />
      </Body>
      <div className={styles.shadow} />
    </>
  );
}

type TutorialContext = {
  editor: Editor;
  setStep: (step: Step) => void;
  onClose: () => void;
};

type Step = keyof typeof Steps;
const Steps = {
  Start: ({ setStep, onClose }) => (
    <>
      <Text as="h2" m={0}>
        Oi, Pai
      </Text>

      <Text as="div">
        Bem-vindo ao meu incrível editor de conteúdos!
        {"\n"}
        Eu fiz um tutorial para ensinar você a usar.
        {"\n"}
        Vamos explorar juntos?
      </Text>

      <Footer>
        <Button variant="solid" color="gray" onClick={onClose}>
          Nee, não mostre mais
        </Button>

        <Button onClick={() => setStep("Content")}>Sim, adoro tutoriais</Button>
      </Footer>
    </>
  ),

  Content: ({ editor, setStep }) => {
    const [disabled, setDisabled] = useState(true);
    const target = useEditorTarget(editor);

    useEffect(() => {
      if (target && target.id !== "a") setDisabled(false);
    }, [target]);

    useEventListener(editor.bus, "commit", () => setDisabled(false));

    return (
      <>
        <ElementFocus selector="#editor-blocks">
          <Text as="div" size="caption">
            Este conteúdo é editável! 👇
          </Text>
        </ElementFocus>

        <BlockSelect id="a" editor={editor} />

        <Row alignY="center">
          <PreviousButton onClick={() => setStep("Start")} />

          <Text as="h2" m={0}>
            1. Selecione uma linha e escreva
          </Text>
        </Row>

        <Text as="div">
          Comece selecionando uma linha para editar, normalmente clicando na
          linha desejada.
          {"\n"}A linha selecionada fica destacada.
        </Text>

        <Text as="div">
          Aqui, já selecionei uma para voce. Linha selecionada:{" "}
          {target ? (
            <Span bold color="pink_background">
              {target.id}
            </Span>
          ) : (
            <Span italic color="gray">
              nenhuma seleção
            </Span>
          )}
        </Text>

        <Text as="div">
          Interaja um pouco com o editor antes de continuar.
          {"\n"}
          Você pode utilizar as setas do teclado para navegar entre as linhas.
        </Text>

        <Footer>
          <Button disabled={disabled} onClick={() => setStep("BlockControl")}>
            Pronto para continuar?
          </Button>
        </Footer>
      </>
    );
  },

  BlockControl: ({ editor, setStep }) => (
    <>
      <ElementFocus selector="#editor-blocks" />

      <ElementFocus zIndex={2} selector="#document-toolbar" />

      <ElementFocus
        selector="#document-toolbar [data-id=block-type-control]"
        onFocus={(element) => {
          handleSelect(editor, "b");
          element.click();
        }}
      >
        <Text as="div" size="caption">
          👇 Controle do tipo de bloco 👇
        </Text>
      </ElementFocus>

      <Row alignY="center">
        <PreviousButton onClick={() => setStep("Content")} />

        <Text as="h2" m={0}>
          2. Toolbar: Controles a nível de bloco
        </Text>
      </Row>

      <Text as="div">
        Você pode modificar propriedades do conteúdo selecionado no toolbar.
        {"\n"}O único controle a nível de bloco é o{" "}
        <Span italic>tipo de bloco</Span>.{"\n"}Aqui você pode mudar o tamanho
        do texto, criar listas e outros tipos de blocos mais avançados.
      </Text>

      <Footer>
        <Button onClick={() => setStep("InlineControl")}>
          Tá bom. Continuar.
        </Button>
      </Footer>
    </>
  ),

  InlineControl: ({ editor, setStep }) => (
    <>
      <ElementFocus selector="#editor-blocks" />

      <ElementFocus zIndex={2} selector="#document-toolbar" />

      <BlockSelect id="b" editor={editor} start={0} />

      <Row alignY="center">
        <PreviousButton onClick={() => setStep("BlockControl")} />

        <Text as="h2" m={0}>
          3. Floating Toolbar: Formatação de texto
        </Text>
      </Row>

      <Text as="div">
        Algumas opções do toolbar, como negrito e itálico, precisam de seleção
        de uma texto para funcionar.
        {"\n"}
        Formatações já aplicadas no texto selecionado são indicadas no toolbar.
        {"\n"}
        Utilize os botões para alternar formatações.
      </Text>

      <Footer>
        <Button onClick={() => setStep("Finish")}>Entendi. Continuar.</Button>
      </Footer>
    </>
  ),

  Finish: ({ onClose, setStep }) => (
    <>
      <ElementFocus selector="#editor-blocks" />

      <ElementFocus zIndex={2} selector="#document-toolbar" />

      <Row alignY="center">
        <PreviousButton onClick={() => setStep("InlineControl")} />

        <Text as="h2" m={0}>
          Prontíssimo
        </Text>
      </Row>

      <Text as="div">
        Achou um bug ou quer elogiar o meu super editor de conteúdo?
        {"\n"}Você pode me mandar feedback das seguintes formas:
        {"\n"}1. Abrindo uma issue no{" "}
        <Link to="https://github.com/gabiseabra/notion-site">
          github@gabiseabra/notion-site
        </Link>
        .{"\n"}2. Mandando um email para{" "}
        <Link to="mailto:hey@gabiseabra.dev">hey@gabiseabra.dev</Link>. .{"\n"}
        3. Entrando em contato de qualquer forma mais prática.
      </Text>

      <Footer>
        <Button onClick={onClose}>Graças</Button>
      </Footer>
    </>
  ),
} satisfies Record<string, FC<TutorialContext>>;

function ElementFocus({
  active = true,
  selector,
  children,
  zIndex = 1,
  onFocus,
}: {
  active?: boolean;
  selector: string;
  children?: ReactNode;
  zIndex?: number;
  onFocus?: (element: HTMLElement) => void;
}) {
  const [elementRect, setElementRect] = useState<DOMRect | null>(null);
  const element = document.querySelector(selector);

  const updateElementRect = useRafThrottledCallback(() => {
    setElementRect(element?.getBoundingClientRect() ?? null);
  }, [element]);

  useResizeObserver(element, updateElementRect);

  useEffect(() => {
    if (!element || !active || !(element instanceof HTMLElement)) return;

    element.style.position = "relative";
    element.style.zIndex = `${zIndex + 1}`;

    onFocus?.(element);

    return () => {
      element.style.position = "";
      element.style.zIndex = "";
    };
  }, [element, active]);

  if (!children) return null;

  return (
    <Popover
      open={!!elementRect}
      updateKey={hash(elementRect)}
      offset={4}
      content={<Col p={2}>{children}</Col>}
      style={{ wrap: { position: "absolute" } }}
    >
      <div
        style={{
          position: "fixed",
          width: elementRect?.width ?? 0,
          height: elementRect?.height ?? 0,
          top: elementRect?.top ?? -1,
          left: elementRect?.left ?? -1,
          userSelect: "none",
          pointerEvents: "none",
        }}
      />
    </Popover>
  );
}

function BlockSelect({
  id,
  editor,
  start,
  end,
  onSelect,
}: {
  id: string;
  editor: Editor;
  start?: number;
  end?: number;
  onSelect?: () => void;
}) {
  useEffect(() => {
    if (handleSelect(editor, id, { start, end })) {
      onSelect?.();
    }
  }, [id]);

  return null;
}

function handleSelect(
  editor: Editor,
  id: string,
  { start, end }: Partial<SelectionRange> = {},
) {
  const element = editor.ref(id).element;
  const textContent = element?.textContent ?? "";

  if (!element) return false;

  element.focus();
  SelectionRange.apply(element, {
    start: start ?? textContent.length,
    end: end ?? textContent.length,
  });

  return true;
}

function Body({
  children,
  onClose,
}: {
  children?: ReactNode;
  onClose: () => void;
}) {
  return (
    <Col className={styles.content} gap={2} alignX="start">
      <IconControl
        as="button"
        size="l"
        p={3.25}
        color="currentColor"
        onClick={onClose}
        style={{ boxSizing: "content-box" }}
        className={styles["close-button"]}
      >
        <IoIosClose />
      </IconControl>

      {children}
    </Col>
  );
}

function Footer({ children }: { children: ReactNode }) {
  return (
    <Row gap={2} alignY="center" alignX="end" style={{ width: "100%" }}>
      {children}
    </Row>
  );
}

function PreviousButton({ onClick }: { onClick: () => void }) {
  return (
    <IconControl
      as="button"
      size="m"
      color="currentColor"
      onClick={onClick}
      style={{ boxSizing: "content-box" }}
    >
      <RxCaretLeft />
    </IconControl>
  );
}
