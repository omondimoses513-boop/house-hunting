import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Newsletter Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-semibold text-foreground mb-2 font-montserrat text-lg">Stay Updated</h3>
              <p className="text-sm text-muted-foreground font-nunito">
                Subscribe to our newsletter for the latest updates on new properties and platform features.
              </p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <Input
                placeholder="Enter your email"
                className="h-10 text-sm font-nunito flex-1 md:flex-none md:w-64"
                type="email"
              />
              <Button size="sm" className="tyrent-gradient text-white font-nunito px-6">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar - All Rights Reserved */}
        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground font-nunito text-center">
            © {new Date().getFullYear()} Tyrent. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
