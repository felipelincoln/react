import { Footer, NavbarHome } from './components';

export function AboutPage() {
  return (
    <>
      <NavbarHome />
      <div className="flex flex-col h-full">
        <div className="max-w-screen-lg w-full mx-auto flex-grow">
          <div className="p-8 flex flex-col gap-8">
            <h1 className="pb-8">About</h1>
            1.
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
