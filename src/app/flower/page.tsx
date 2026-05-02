import Image from 'next/image'

export default function FlowerPage() {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <Image
        src="/secretFlower.jpeg"
        alt="secretFlower"
        fill
        className="object-contain"
        unoptimized
      />
    </div>
  )
}
