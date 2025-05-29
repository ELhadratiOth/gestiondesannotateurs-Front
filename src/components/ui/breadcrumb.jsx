import * as React from "react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"

const Breadcrumb = React.forwardRef(
  ({ className, ...props }, ref) => (
    <nav
      ref={ref}
      aria-label="breadcrumb"
      className={cn("flex items-center text-sm", className)}
      {...props}
    />
  )
)
Breadcrumb.displayName = "Breadcrumb"

const BreadcrumbItem = React.forwardRef(
  ({ className, ...props }, ref) => (
    <li
      ref={ref}
      className={cn("inline-flex items-center", className)}
      {...props}
    />
  )
)
BreadcrumbItem.displayName = "BreadcrumbItem"

const BreadcrumbLink = React.forwardRef(
  ({ asChild, className, href, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : href ? Link : "span"
    const linkProps = href ? { to: href } : {}
    
    return (
      <Comp
        ref={ref}
        className={cn("opacity-80 hover:opacity-100 transition-opacity", className)}
        {...linkProps}
        {...props}
      />
    )
  }
)
BreadcrumbLink.displayName = "BreadcrumbLink"

export { Breadcrumb, BreadcrumbItem, BreadcrumbLink }