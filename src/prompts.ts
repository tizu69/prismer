import { MultiSelectPrompt, TextPrompt, type State } from "@clack/core";
import isUnicodeSupported from "is-unicode-supported";
import color from "picocolors";
import { truncateString } from "./utils";
export { isCancel } from "@clack/core";

const unicode = isUnicodeSupported();
const s = (c: string, fallback: string) => (unicode ? c : fallback);

const S_STEP_ACTIVE = s("◆", "*");
const S_STEP_CANCEL = s("■", "x");
const S_STEP_ERROR = s("▲", "x");
const S_STEP_SUBMIT = s("◇", "o");
const S_BAR = s("│", "|");
const S_BAR_END = s("└", "—");
const S_CHECKBOX_ACTIVE = s("◻", "[•]");
const S_CHECKBOX_SELECTED = s("◼", "[+]");
const S_CHECKBOX_INACTIVE = s("◻", "[ ]");

function symbol(state: State) {
	switch (state) {
		case "initial":
		case "active":
			return color.cyan(S_STEP_ACTIVE);
		case "cancel":
			return color.red(S_STEP_CANCEL);
		case "error":
			return color.yellow(S_STEP_ERROR);
		case "submit":
			return color.green(S_STEP_SUBMIT);
	}
}

type Primitive = Readonly<string | boolean | number>;
type Option<Value> = Value extends Primitive
	? { value: Value; label?: string; hint?: string }
	: { value: Value; label: string; hint?: string };

type LimitOptionsParams<TOption> = {
	options: TOption[];
	maxItems: number | undefined;
	cursor: number;
	style: (option: TOption, active: boolean) => string;
};

function limitOptions<TOption>(params: LimitOptionsParams<TOption>): string[] {
	const { cursor, options, style } = params;

	// We clamp to minimum 5 because anything less doesn't make sense UX wise
	const maxItems =
		params.maxItems === undefined
			? Number.POSITIVE_INFINITY
			: Math.max(params.maxItems, 5);
	let slidingWindowLocation = 0;

	if (cursor >= slidingWindowLocation + maxItems - 3) {
		slidingWindowLocation = Math.max(
			Math.min(cursor - maxItems + 3, options.length - maxItems),
			0,
		);
	} else if (cursor < slidingWindowLocation + 2) {
		slidingWindowLocation = Math.max(cursor - 2, 0);
	}

	const shouldRenderTopEllipsis =
		maxItems < options.length && slidingWindowLocation > 0;
	const shouldRenderBottomEllipsis =
		maxItems < options.length &&
		slidingWindowLocation + maxItems < options.length;

	return options
		.slice(slidingWindowLocation, slidingWindowLocation + maxItems)
		.map((option, i, arr) => {
			const totalItemsAbove = slidingWindowLocation;
			const totalItemsBelow =
				options.length - (slidingWindowLocation + maxItems);

			const isTopLimit =
				i === 0 && shouldRenderTopEllipsis && totalItemsAbove > 0;
			const isBottomLimit =
				i === arr.length - 1 &&
				shouldRenderBottomEllipsis &&
				totalItemsBelow > 0;

			if (isTopLimit) {
				return color.dim(`↑ ${totalItemsAbove + 1} more`);
			} else if (isBottomLimit) {
				return color.dim(`↓ ${totalItemsBelow + 1} more`);
			} else {
				return style(option, i + slidingWindowLocation === cursor);
			}
		});
}

export type MultiSelectOptions<Value> = {
	message: string;
	options: Option<Value>[];
	initialValues?: Value[];
	maxItems?: number;
	required?: boolean;
	cursorAt?: Value;
};
export function multiselect<Value>(opts: MultiSelectOptions<Value>) {
	const opt = (
		option: Option<Value>,
		state:
			| "inactive"
			| "active"
			| "selected"
			| "active-selected"
			| "submitted"
			| "cancelled",
	) => {
		const label = option.label ?? String(option.value);
		if (state === "active") {
			return `${color.cyan(S_CHECKBOX_ACTIVE)} ${label} ${
				option.hint ? color.dim(`(${option.hint})`) : ""
			}`;
		} else if (state === "selected") {
			return `${color.green(S_CHECKBOX_SELECTED)} ${color.dim(label)}`;
		} else if (state === "cancelled") {
			return `${color.strikethrough(color.dim(label))}`;
		} else if (state === "active-selected") {
			return `${color.green(S_CHECKBOX_SELECTED)} ${label} ${
				option.hint ? color.dim(`(${option.hint})`) : ""
			}`;
		} else if (state === "submitted") {
			return `${color.dim(label)}`;
		}
		return `${color.dim(S_CHECKBOX_INACTIVE)} ${color.dim(label)}`;
	};

	return new MultiSelectPrompt({
		options: opts.options,
		initialValues: opts.initialValues,
		required: opts.required ?? true,
		cursorAt: opts.cursorAt,
		validate(selected: Value[]) {
			if (this.required && selected.length === 0)
				return `Please select at least one option.\n${color.reset(
					color.dim(
						`Press ${color.gray(color.bgWhite(color.inverse(" space ")))} to select, ${color.gray(
							color.bgWhite(color.inverse(" enter ")),
						)} to submit`,
					),
				)}`;
		},
		render() {
			const title = `${color.gray(S_BAR)}\n${symbol(this.state)}  ${opts.message}\n`;

			const styleOption = (option: Option<Value>, active: boolean) => {
				const selected = this.value.includes(option.value);
				if (active && selected) {
					return opt(option, "active-selected");
				}
				if (selected) {
					return opt(option, "selected");
				}
				return opt(option, active ? "active" : "inactive");
			};

			switch (this.state) {
				case "submit": {
					return `${title}${color.gray(S_BAR)}  ${truncateString(
						this.options
							.filter(({ value }) => this.value.includes(value))
							.map((option) => opt(option, "submitted"))
							.join(color.dim(", ")) || color.dim("none"),
						200,
					)}`;
				}
				case "cancel": {
					const label = truncateString(
						this.options
							.filter(({ value }) => this.value.includes(value))
							.map((option) => opt(option, "cancelled"))
							.join(color.dim(", ")),
						200,
					);
					return `${title}${color.gray(S_BAR)}  ${
						label.trim() ? `${label}\n${color.gray(S_BAR)}` : ""
					}`;
				}
				case "error": {
					const footer = this.error
						.split("\n")
						.map((ln, i) =>
							i === 0
								? `${color.yellow(S_BAR_END)}  ${color.yellow(ln)}`
								: `   ${ln}`,
						)
						.join("\n");
					return `${title + color.yellow(S_BAR)}  ${limitOptions({
						options: this.options,
						cursor: this.cursor,
						maxItems: opts.maxItems,
						style: styleOption,
					}).join(`\n${color.yellow(S_BAR)}  `)}\n${footer}\n`;
				}
				default: {
					return `${title}${color.cyan(S_BAR)}  ${limitOptions({
						options: this.options,
						cursor: this.cursor,
						maxItems: opts.maxItems,
						style: styleOption,
					}).join(
						`\n${color.cyan(S_BAR)}  `,
					)}\n${color.cyan(S_BAR_END)}\n`;
				}
			}
		},
	}).prompt() as Promise<Value[] | symbol>;
}

export interface TextOptions {
	message: string;
	placeholder?: string;
	defaultValue?: string;
	initialValue?: string;
	validate?: (value: string) => string | void;
	hint?: (value: string) => string | void;
}
export const text = (opts: TextOptions) => {
	return new TextPrompt({
		validate: opts.validate,
		placeholder: opts.placeholder,
		defaultValue: opts.defaultValue,
		initialValue: opts.initialValue,
		render() {
			const title = `${color.gray(S_BAR)}\n${symbol(this.state)}  ${opts.message}\n`;
			const placeholder = opts.placeholder
				? color.inverse(opts.placeholder[0]) +
					color.dim(opts.placeholder.slice(1))
				: color.inverse(color.hidden("_"));
			const value = !this.value ? placeholder : this.valueWithCursor;

			const hintValue = opts.hint ? opts.hint(this.value) : "";
			const formattedHint = hintValue ? `(${hintValue})` : "";

			switch (this.state) {
				case "error":
					return `${title.trim()}\n${color.yellow(S_BAR)}  ${value}  ${color.dim(formattedHint)}\n${color.yellow(
						S_BAR_END,
					)}  ${color.yellow(this.error)}\n`;
				case "submit":
					return `${title}${color.gray(S_BAR)}  ${color.dim(this.value || opts.placeholder)}`;
				case "cancel":
					return `${title}${color.gray(S_BAR)}  ${color.strikethrough(
						color.dim(this.value ?? ""),
					)}${this.value?.trim() ? "\n" + color.gray(S_BAR) : ""}`;
				default:
					return `${title}${color.cyan(S_BAR)}  ${value}  ${color.dim(formattedHint)}\n${color.cyan(S_BAR_END)}\n`;
			}
		},
	}).prompt() as Promise<string | symbol>;
};
