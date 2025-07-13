import IpaChart from "./IpaChart"

interface SeeProps {
    startAnimation?: boolean;
}

export default function See({ startAnimation = false }: SeeProps) {
    return(
        <div className="flex-1 bg-gradient-to-br from-blue-800/20 to-purple-800/20 rounded-lg p-6 border border-blue-500/30 font-['Helvetica']">
            <h3 className="text-2xl font-bold text-white mb-4">See it</h3>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <IpaChart startAnimation={startAnimation} />
            </div>
        </div>
    )
}