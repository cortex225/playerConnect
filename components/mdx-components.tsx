import { useMDXComponent } from 'next-contentlayer/hooks'
import Image from 'next/image'
import Link from 'next/link'

const components = {
  Image,
  a: ({ href = '', ...props }) => {
    if (href.startsWith('http')) {
      return <a href={href} target="_blank" rel="noopener noreferrer" {...props} />
    }
    return <Link href={href} {...props} />
  }
}

interface MdxProps {
  code: string
}

export function Mdx({ code }: MdxProps) {
  const Component = useMDXComponent(code)
  return <Component components={components} />
} 