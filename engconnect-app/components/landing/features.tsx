import { Video, MessageSquare, Award, Mic } from "lucide-react";

export function Features() {
  const features = [
    {
      icon: MessageSquare,
      title: "Real Conversation Practice",
      description: "Practice speaking with native tutors in real-time. Build confidence through daily conversations.",
    },
    {
      icon: Video,
      title: "Live Interactive Sessions",
      description: "Join group classes and one-on-one sessions. Learn grammar, vocabulary, and pronunciation.",
    },
    {
      icon: Mic,
      title: "Pronunciation Coaching",
      description: "Perfect your accent with AI-powered feedback and expert guidance from native speakers.",
    },
    {
      icon: Award,
      title: "Certified Programs",
      description: "Get internationally recognized certificates. Prepare for IELTS, TOEFL, and business English.",
    },
  ];

  return (
    <section className="py-20 px-8 bg-secondary/30" id="features">
      <div className="max-w-[1440px] mx-auto">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-foreground text-4xl font-semibold tracking-tight">
            Why Learn English with Us?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Master English fluency with personalized learning paths and expert native tutors.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-card border border-border rounded-2xl p-6 space-y-4 hover:border-primary/30 hover:shadow-lg transition-all group"
            >
              <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-foreground text-lg font-semibold">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
