/*
 * Vercel I love u n all but pls publish sane typedefs and 3.0.0 :3
 * https://github.com/vercel/ms/blob/main/src/index.ts is licensed under the MIT license:
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2022 Vercel, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const s = 1000;
const m = s * 60;
const h = m * 60;
const d = h * 24;
const w = d * 7;
const y = d * 365.25;

type Unit =
	| "Days"
	| "Day"
	| "D"
	| "Hours"
	| "Hour"
	| "Hrs"
	| "Hr"
	| "H"
	| "Minutes"
	| "Minute"
	| "Mins"
	| "Min"
	| "M"
	| "Seconds"
	| "Second"
	| "Secs"
	| "Sec"
	| "s"
	| "Milliseconds"
	| "Millisecond"
	| "Msecs"
	| "Msec"
	| "Ms";

export function parseMillis(str: string): number {
	if (typeof str !== "string" || str.length === 0 || str.length > 100)
		throw new Error("idk wrong thingy");

	const match =
		/^(?<value>(?:\d+)?\.?\d+) *(?<type>milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d)?$/i.exec(
			str,
		);

	const groups = match?.groups as
		| { value: string; type?: string }
		| undefined;
	if (!groups) throw new Error("oopsie woopsie wrong number :3");

	const n = parseFloat(groups.value);
	const type = (groups.type || "ms").toLowerCase() as Lowercase<Unit>;
	switch (type) {
		case "days":
		case "day":
		case "d":
			return n * d;
		case "hours":
		case "hour":
		case "hrs":
		case "hr":
		case "h":
			return n * h;
		case "minutes":
		case "minute":
		case "mins":
		case "min":
		case "m":
			return n * m;
		case "seconds":
		case "second":
		case "secs":
		case "sec":
		case "s":
			return n * s;
		case "milliseconds":
		case "millisecond":
		case "msecs":
		case "msec":
		case "ms":
			return n;
		default:
			throw new Error(`${type as string} invalid`);
	}
}

export function formatMillis(ms: number) {
	const msAbs = Math.abs(ms);
	if (msAbs >= d) {
		return plural(ms, msAbs, d, "day");
	}
	if (msAbs >= h) {
		return plural(ms, msAbs, h, "hour");
	}
	if (msAbs >= m) {
		return plural(ms, msAbs, m, "minute");
	}
	return plural(ms, msAbs, s, "second");
}

function plural(ms: number, msAbs: number, n: number, name: string): string {
	const isPlural = msAbs >= n * 1.5;
	return `${Math.round(ms / n)} ${name}${isPlural ? "s" : ""}`;
}
