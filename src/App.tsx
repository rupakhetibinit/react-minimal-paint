import { createContext, useLayoutEffect, useRef, useState } from 'react';
import rough from 'roughjs';
import type { Drawable } from 'roughjs/bin/core';
import './App.css';

const generator = rough.generator();

function createElement(
	id: number,
	x1: any,
	y1: any,
	x2: any,
	y2: any,
	elementType: string
) {
	let roughElement: Drawable;
	if (elementType === 'line') {
		roughElement = generator.line(x1, y1, x2, y2);
	} else {
		roughElement = generator.rectangle(x1, y1, x2 - x1, y2 - y1);
	}

	return { id, x1, y1, x2, y2, roughElement, elementType };
}

function getElementAtPosition(x: any, y: any, elements: ElementState[]) {
	return elements.find((element: any) => isWithinElement(x, y, element));
}

function isWithinElement(x: any, y: any, element: ElementState) {
	const { elementType, x1, y1, x2, y2 } = element;
	if (elementType === 'rectangle') {
		const minX = Math.min(x1, x2);
		const maxX = Math.max(x1, x2);
		const minY = Math.min(y1, y2);
		const maxY = Math.max(y1, y2);
		return x >= minX && x <= maxX && y >= minY && y <= maxY;
	} else {
		const a = { x: x1, y: y1 };
		const b = { x: x2, y: y2 };
		const c = { x, y };
		console.log({ c });
		const offset = distance(a, b) - distance(a, c) - distance(b, c);
		console.log(offset);
		console.log(Math.abs(offset));
		return Math.abs(offset) < 5;
	}
}

const distance = (a: any, b: any) =>
	Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

interface ElementState {
	x1: any;
	y1: any;
	x2: any;
	y2: any;
	roughElement: Drawable;
	elementType: string;
	id: number;
}

function App() {
	const [elements, setElements] = useState<ElementState[] | []>([]);
	const [action, setAction] = useState('none');
	const [tool, setTool] = useState<string>('line');
	const [selectedElement, setSelectedElement] = useState<ElementState | null>(
		null
	);
	const firstRun = useRef(true);
	let canvasContext = useRef<CanvasRenderingContext2D | null>(null);
	useLayoutEffect(() => {
		const canvas = document.getElementById('canvas') as HTMLCanvasElement;
		const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
		// canvasContext.current?.clearRect(0, 0, window.innerWidth, innerHeight);
		ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
		// canvasContext.current = ctx;
		const roughCanvas = rough.canvas(canvas, {
			options: {
				roughness: 0,
				strokeLineDash: [1, 1],
			},
		});

		// if (firstRun.current) {
		// 	const rect = generator.rectangle(10, 10, 100, 100);
		// 	roughCanvas.draw(rect);
		// 	firstRun.current = false;
		// }

		elements.forEach(({ roughElement }) => roughCanvas.draw(roughElement));
		console.log('ran uselayouteffect');
	}),
		[elements];

	const updateElement = (
		id: number,
		x1: any,
		y1: any,
		x2: any,
		y2: any,
		type: string
	) => {
		const updatedElement = createElement(id, x1, y1, x2, y2, type);
		const elementsCopy = [...elements];
		elementsCopy[id] = updatedElement;
		setElements(elementsCopy);
	};

	const onMouseDown = (event: any) => {
		const { clientX, clientY } = event;
		if (tool === 'selection') {
			const element = getElementAtPosition(clientX, clientY, elements);
			console.log(element);
			if (element !== undefined) {
				setSelectedElement(element);
				setAction('moving');
			}
		} else {
			const id = elements.length;
			console.log('mouse down event', clientX, clientY);
			const element = createElement(
				id,
				clientX,
				clientY,
				clientX,
				clientY,
				tool
			);
			setElements((prev: any) => [...prev, element]);
			setAction('drawing');
		}
	};

	const onMouseMove = (event: any) => {
		const { clientX, clientY } = event;
		if (action === 'drawing') {
			console.log(clientX, clientY);
			const index = elements.length - 1;
			const { x1, y1 } = elements[index];
			updateElement(index, x1, y1, clientX, clientY, tool);
		} else if (action === 'moving') {
			const { id, x1, x2, y1, y2, elementType } =
				selectedElement as ElementState;
			if (elementType === 'rectangle') {
				const width = x2 - x1;
				const height = y2 - y1;
				updateElement(
					id,
					clientX,
					clientY,
					clientX + width,
					clientY + height,
					tool
				);
			}
		}
	};

	const onMouseUp = () => {
		setAction('none');
		setSelectedElement(null);
	};

	return (
		<>
			<div>
				<button onClick={() => setElements([])}>Clear canvas</button>
				<input
					type='radio'
					onChange={() => setTool('selection')}
					id='selection'
					checked={tool === 'selection'}></input>
				<label htmlFor='selection'>Selection</label>
				<input
					type='radio'
					onChange={() => setTool('line')}
					id='line'
					checked={tool === 'line'}></input>
				<label htmlFor='line'>Line</label>
				<input
					type='radio'
					id='rectangle'
					onChange={() => setTool('rectangle')}
					checked={tool === 'rectangle'}></input>
				<label htmlFor='rectangle'>Rectangle</label>
				<canvas
					width={window.innerWidth}
					height={window.innerHeight}
					id='canvas'
					onMouseDown={onMouseDown}
					onMouseMove={onMouseMove}
					onMouseUp={onMouseUp}>
					Canvas
				</canvas>
			</div>
		</>
	);
}

export default App;
