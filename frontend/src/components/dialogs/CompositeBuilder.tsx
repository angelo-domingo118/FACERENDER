import { FC } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'

export type FeatureCategory = 'faceShape' | 'nose' | 'mouth' | 'eyes' | 'eyebrows' | 'ears';

interface CompositeBuilderProps {
  open: boolean;
  onClose: () => void;
}

export const CompositeBuilder: FC<CompositeBuilderProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        {/* Your composite builder content */}
      </DialogContent>
    </Dialog>
  )
} 