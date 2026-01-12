// Date utilities using date-fns

import { format, formatDistanceToNow, differenceInDays } from 'date-fns'

export function formatDate(date: Date | string): string {
  return format(new Date(date), 'MMM dd, yyyy')
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), 'MMM dd, yyyy HH:mm')
}

export function formatRelativeTime(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function daysBetween(startDate: Date | string, endDate: Date | string): number {
  return differenceInDays(new Date(endDate), new Date(startDate))
}

export function daysSince(date: Date | string): number {
  return differenceInDays(new Date(), new Date(date))
}





