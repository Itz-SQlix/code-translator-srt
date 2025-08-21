import { Brain, ArrowRightLeft, Code } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Translation",
    description: "Advanced AI models understand context and programming patterns for accurate translations",
    gradient: "from-accent-blue to-accent-purple",
  },
  {
    icon: ArrowRightLeft,
    title: "Bidirectional Support",
    description: "Translate between any supported languages in both directions seamlessly",
    gradient: "from-accent-green to-accent-blue",
  },
  {
    icon: Code,
    title: "Syntax Preservation",
    description: "Maintains code structure, comments, and best practices during translation",
    gradient: "from-accent-purple to-accent-orange",
  },
];

export default function FeatureCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {features.map((feature, index) => (
        <div key={index} className="glassmorphism p-6 rounded-2xl text-center">
          <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
            <feature.icon className="text-white text-2xl" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-dark-100 mb-2">{feature.title}</h3>
          <p className="text-dark-400 text-sm">{feature.description}</p>
        </div>
      ))}
    </div>
  );
}
