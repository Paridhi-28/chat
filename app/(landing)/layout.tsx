const LandingLayout = ({
    children
}:
    {
        children: React.ReactNode
    }) => {
    return (
        <main className="h-full bg-[#111827] overflow-auto">
            <div className="max-auto max-w-screen-3xl h-full w-full">
                {children}
            </div>
        </main>
    );
}

export default LandingLayout;