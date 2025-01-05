import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const colors = [
  'bg-red-200',
  'bg-pink-200',
  'bg-purple-200',
  'bg-indigo-200',
  'bg-blue-200',
  'bg-cyan-200',
  'bg-teal-200',
  'bg-green-200',
  'bg-lime-200',
  'bg-yellow-200',
  'bg-orange-200',
  'bg-amber-200',
  'bg-red-300',
  'bg-pink-300',
  'bg-purple-300',
  'bg-indigo-300',
  'bg-blue-300',
  'bg-cyan-300',
  'bg-teal-300',
  'bg-green-300',
  'bg-lime-300',
  'bg-yellow-300',
  'bg-orange-300',
  'bg-amber-300',
];

export function getRandomColor(): string {
  // Generamos un color hexadecimal válido
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
