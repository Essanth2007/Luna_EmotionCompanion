'use client';

import { motion } from 'framer-motion';
import { Target, Users, Award, Globe } from 'lucide-react';

const About = () => {
  const stats = [
    {
      icon: Users,
      value: '50K+',
      label: 'Active Users',
    },
    {
      icon: Target,
      value: '95%',
      label: 'Satisfaction Rate',
    },
    {
      icon: Award,
      value: '4.9',
      label: 'App Rating',
    },
    {
      icon: Globe,
      value: '30+',
      label: 'Countries',
    },
  ];

  const values = [
    {
      title: 'Empathy First',
      description:
        'We believe emotional well-being should be accessible to everyone with compassion and understanding.',
    },
    {
      title: 'Science-Backed',
      description:
        'Our approach is grounded in psychological research and validated by mental health professionals.',
    },
    {
      title: 'Continuous Innovation',
      description:
        'We constantly improve our AI algorithms to provide more accurate and helpful insights.',
    },
  ];

  return (
    <section id="about" className="section-padding relative gradient-bg">
      <div className="container-custom">
        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gradient">Our Mission</span>
          </h2>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto leading-relaxed">
            To empower individuals to understand and improve their emotional well-being 
            through accessible AI-powered tools, fostering a world where mental health 
            is prioritized and celebrated.
          </p>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              className="glass p-6 rounded-2xl text-center hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 border border-border/50"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="text-3xl font-bold text-gradient mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-foreground/70">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {values.map((value, index) => (
            <div
              key={index}
              className="glass p-8 rounded-2xl hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 border border-border/50"
            >
              <h3 className="text-xl font-semibold mb-4 text-foreground">
                {value.title}
              </h3>
              <p className="text-foreground/70 leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default About;
