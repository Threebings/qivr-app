import { Clock, User } from 'lucide-react';

interface ArticleReaderProps {
  title: string;
  content: string;
  author?: string;
  readTime: number;
}

export function ArticleReader({ title, content, author = 'Qivr Medical Team', readTime }: ArticleReaderProps) {
  const sampleContent = `
## Introduction

Recovery from orthopaedic surgery is a journey that requires patience, dedication, and proper guidance. This comprehensive guide will walk you through what to expect during your recovery period and provide you with practical strategies to optimize your healing.

## What to Expect

### Week 1: The Initial Recovery Phase

The first week after surgery is crucial for setting the foundation for your recovery. During this time, you may experience:

- **Pain and Discomfort**: This is completely normal. Your surgical team will provide pain management strategies to keep you comfortable.
- **Swelling**: Elevation and ice therapy are your best friends during this phase.
- **Limited Mobility**: Rest is important, but gentle movement as directed by your medical team helps prevent complications.

### Weeks 2-4: Building Momentum

As you enter the second and third weeks, you'll notice gradual improvements:

- Pain levels typically decrease significantly
- Range of motion begins to improve with physical therapy
- You may transition from assistive devices like crutches or walkers
- Return to some daily activities becomes possible

## Key Recovery Strategies

### 1. Follow Your Exercise Program

Physical therapy exercises are not optional - they're essential for optimal recovery. Even when exercises feel challenging or uncomfortable:

- Start slowly and build gradually
- Consistency matters more than intensity
- Never skip your prescribed exercises
- Communicate with your physical therapist about any concerns

### 2. Manage Pain Effectively

Effective pain management allows you to participate in rehabilitation:

- Take medications as prescribed
- Use ice therapy: 15-20 minutes, 3-4 times daily
- Elevate the surgical site above heart level
- Practice relaxation techniques and deep breathing

### 3. Nutrition for Healing

Your body needs proper fuel to repair tissues:

- **Protein**: Essential for tissue repair (aim for 20-30g per meal)
- **Vitamin C**: Supports collagen formation
- **Calcium and Vitamin D**: Critical for bone healing
- **Hydration**: Aim for 8-10 glasses of water daily

### 4. Rest and Recovery

Quality sleep is when your body does most of its healing:

- Aim for 7-9 hours of sleep per night
- Use pillows to support comfortable positioning
- Maintain a consistent sleep schedule
- Limit screen time before bed

## Warning Signs

Contact your surgeon immediately if you experience:

- Sudden increase in pain not relieved by medication
- Fever over 101°F (38.3°C)
- Increasing redness, warmth, or drainage from incision
- Chest pain or difficulty breathing
- Calf pain or swelling (could indicate blood clot)

## Milestones to Celebrate

Recovery isn't linear, but you'll hit important milestones:

- ✓ First day without prescription pain medication
- ✓ Walking without assistive devices
- ✓ Full range of motion restored
- ✓ Return to driving (with surgeon approval)
- ✓ Back to work or daily activities
- ✓ Return to recreational activities

## Long-Term Success

Remember that full recovery can take 3-6 months or longer depending on your procedure. Be patient with yourself and celebrate small victories along the way.

## Conclusion

Your commitment to following medical advice, completing your exercises, and maintaining a positive mindset will significantly impact your recovery outcome. You're not alone in this journey - your medical team is here to support you every step of the way.

If you have questions or concerns at any point during your recovery, don't hesitate to reach out to your healthcare providers or use the Qivr chat feature for guidance.
  `.trim();

  const displayContent = content || sampleContent;

  return (
    <div className="bg-white">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#1F2937] mb-4">{title}</h1>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>{author}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{readTime} min read</span>
            </div>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          {displayContent.split('\n\n').map((paragraph, index) => {
            if (paragraph.startsWith('## ')) {
              return (
                <h2 key={index} className="text-2xl font-bold text-qivr-blue mt-8 mb-4">
                  {paragraph.replace('## ', '')}
                </h2>
              );
            } else if (paragraph.startsWith('### ')) {
              return (
                <h3 key={index} className="text-xl font-semibold text-[#374151] mt-6 mb-3">
                  {paragraph.replace('### ', '')}
                </h3>
              );
            } else if (paragraph.startsWith('- **')) {
              const items = paragraph.split('\n');
              return (
                <ul key={index} className="list-none space-y-3 my-4">
                  {items.map((item, i) => {
                    const match = item.match(/- \*\*([^*]+)\*\*: (.+)/);
                    if (match) {
                      return (
                        <li key={i} className="flex">
                          <span className="font-semibold text-qivr-blue mr-2">{match[1]}:</span>
                          <span className="text-gray-700">{match[2]}</span>
                        </li>
                      );
                    }
                    return null;
                  })}
                </ul>
              );
            } else if (paragraph.startsWith('- ')) {
              const items = paragraph.split('\n');
              return (
                <ul key={index} className="list-disc list-inside space-y-2 my-4 text-gray-700">
                  {items.map((item, i) => (
                    <li key={i} className="ml-4">{item.replace('- ', '')}</li>
                  ))}
                </ul>
              );
            } else if (paragraph.match(/^[✓✗]/)) {
              const items = paragraph.split('\n');
              return (
                <ul key={index} className="list-none space-y-2 my-4">
                  {items.map((item, i) => (
                    <li key={i} className="flex items-center space-x-2">
                      <span className="text-green-500 text-xl">{item.charAt(0)}</span>
                      <span className="text-gray-700">{item.slice(2)}</span>
                    </li>
                  ))}
                </ul>
              );
            } else {
              return (
                <p key={index} className="text-gray-700 leading-relaxed mb-4">
                  {paragraph.split('**').map((part, i) =>
                    i % 2 === 0 ? (
                      part
                    ) : (
                      <strong key={i} className="font-semibold text-gray-900">{part}</strong>
                    )
                  )}
                </p>
              );
            }
          })}
        </div>
      </div>
    </div>
  );
}
