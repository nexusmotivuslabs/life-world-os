/**
 * Weapons Page - Coming Soon
 * 
 * Placeholder for the Weapons mode/plane.
 * Weapons will be tools, strategies, and capabilities that users can equip and use.
 */

import ComingSoon from './ComingSoon'
import { Sword } from 'lucide-react'

export default function Weapons() {
  return (
    <ComingSoon
      title="Weapons"
      description="Equip powerful tools, strategies, and capabilities to enhance your effectiveness in Life World OS. Weapons are your arsenal for navigating challenges and achieving goals."
      icon={Sword}
      color="text-red-400"
      bgColor="bg-red-600/20"
      backPath="/"
    />
  )
}


